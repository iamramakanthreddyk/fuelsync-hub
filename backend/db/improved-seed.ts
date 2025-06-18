import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Helper function to execute SQL with parameters
async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

// Main seed function
async function seed() {
  console.log('Starting database seeding with improved hierarchy...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    client.release();
    
    // Step 1: Create admin user
    const adminId = uuidv4();
    const adminPassword = await hashPassword('admin123');
    
    console.log('Creating admin user');
    
    await executeQuery(
      `INSERT INTO public.admin_users (id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [adminId, 'admin@fuelsync.com', adminPassword, 'superadmin', 'Admin', 'User']
    );
    
    // Step 2: Create tenants
    const tenant1Id = uuidv4();
    const tenant1Name = 'Demo Fuel Company';
    const tenant1Email = 'demo@fuelsync.com';
    
    console.log(`Creating tenant: ${tenant1Name}`);
    
    await executeQuery(
      `INSERT INTO public.tenants (id, name, email, subscription_plan, status, contact_person)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [tenant1Id, tenant1Name, tenant1Email, 'premium', 'active', 'Demo Admin']
    );
    
    // Step 3: Create owner for tenant
    const ownerPassword = await hashPassword('owner123');
    const ownerId = uuidv4();
    
    console.log('Creating owner user');
    
    await executeQuery(
      `INSERT INTO public.users (id, email, password_hash, role, first_name, last_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email, tenant_id) DO NOTHING
       RETURNING id`,
      [ownerId, 'owner@demo.com', ownerPassword, 'owner', 'John', 'Owner', tenant1Id]
    );
    
    // Step 4: Create stations for owner
    const station1Id = uuidv4();
    const station2Id = uuidv4();
    
    console.log('Creating stations');
    
    await executeQuery(
      `INSERT INTO public.stations (id, tenant_id, name, address, city, state, zip, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (tenant_id, name) DO NOTHING
       RETURNING id`,
      [station1Id, tenant1Id, 'Main Street Station', '123 Main St', 'Anytown', 'State', '12345', '555-1234']
    );
    
    await executeQuery(
      `INSERT INTO public.stations (id, tenant_id, name, address, city, state, zip, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (tenant_id, name) DO NOTHING
       RETURNING id`,
      [station2Id, tenant1Id, 'Highway Station', '456 Highway Rd', 'Othertown', 'State', '67890', '555-5678']
    );
    
    // Step 5: Assign owner to stations
    console.log('Assigning owner to stations');
    
    await executeQuery(
      `INSERT INTO public.user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), ownerId, station1Id, 'owner']
    );
    
    await executeQuery(
      `INSERT INTO public.user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), ownerId, station2Id, 'owner']
    );
    
    // Step 6: Create manager and employee users
    const managerPassword = await hashPassword('manager123');
    const employeePassword = await hashPassword('employee123');
    
    const managerId = uuidv4();
    const employeeId = uuidv4();
    
    console.log('Creating manager and employee users');
    
    await executeQuery(
      `INSERT INTO public.users (id, email, password_hash, role, first_name, last_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      [managerId, 'manager@demo.com', managerPassword, 'manager', 'Jane', 'Manager', tenant1Id]
    );
    
    await executeQuery(
      `INSERT INTO public.users (id, email, password_hash, role, first_name, last_name, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      [employeeId, 'employee@demo.com', employeePassword, 'employee', 'Bob', 'Employee', tenant1Id]
    );
    
    // Step 7: Assign manager and employee to stations
    console.log('Assigning manager and employee to stations');
    
    await executeQuery(
      `INSERT INTO public.user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), managerId, station1Id, 'manager']
    );
    
    await executeQuery(
      `INSERT INTO public.user_stations (id, user_id, station_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, station_id) DO NOTHING`,
      [uuidv4(), employeeId, station1Id, 'attendant']
    );
    
    // Step 8: Create pumps for stations
    const pump1Id = uuidv4();
    const pump2Id = uuidv4();
    const pump3Id = uuidv4();
    
    console.log('Creating pumps');
    
    await executeQuery(
      `INSERT INTO public.pumps (id, station_id, name, serial_number, installation_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (serial_number) DO NOTHING`,
      [pump1Id, station1Id, 'Pump 1', 'SN12345', '2023-01-01']
    );
    
    await executeQuery(
      `INSERT INTO public.pumps (id, station_id, name, serial_number, installation_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (serial_number) DO NOTHING`,
      [pump2Id, station1Id, 'Pump 2', 'SN67890', '2023-01-01']
    );
    
    await executeQuery(
      `INSERT INTO public.pumps (id, station_id, name, serial_number, installation_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (serial_number) DO NOTHING`,
      [pump3Id, station2Id, 'Pump 1', 'SN24680', '2023-01-01']
    );
    
    // Step 9: Create nozzles for pumps (at least 2 per pump)
    const nozzle1Id = uuidv4();
    const nozzle2Id = uuidv4();
    const nozzle3Id = uuidv4();
    const nozzle4Id = uuidv4();
    const nozzle5Id = uuidv4();
    const nozzle6Id = uuidv4();
    
    console.log('Creating nozzles');
    
    await executeQuery(
      `INSERT INTO public.nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle1Id, pump1Id, 'petrol', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO public.nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle2Id, pump1Id, 'diesel', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO public.nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle3Id, pump2Id, 'petrol', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO public.nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle4Id, pump2Id, 'diesel', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO public.nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle5Id, pump3Id, 'petrol', 0, 0]
    );
    
    await executeQuery(
      `INSERT INTO public.nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $4, $5)`,
      [nozzle6Id, pump3Id, 'diesel', 0, 0]
    );
    
    // Step 10: Create fuel prices for stations
    console.log('Creating fuel prices');
    
    await executeQuery(
      `INSERT INTO public.fuel_price_history (id, station_id, fuel_type, price_per_unit, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), station1Id, 'petrol', 3.99, ownerId]
    );
    
    await executeQuery(
      `INSERT INTO public.fuel_price_history (id, station_id, fuel_type, price_per_unit, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), station1Id, 'diesel', 3.79, ownerId]
    );
    
    await executeQuery(
      `INSERT INTO public.fuel_price_history (id, station_id, fuel_type, price_per_unit, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), station2Id, 'petrol', 4.09, ownerId]
    );
    
    await executeQuery(
      `INSERT INTO public.fuel_price_history (id, station_id, fuel_type, price_per_unit, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), station2Id, 'diesel', 3.89, ownerId]
    );
    
    // Step 11: Create creditors
    const creditor1Id = uuidv4();
    const creditor2Id = uuidv4();
    
    console.log('Creating creditors');
    
    await executeQuery(
      `INSERT INTO public.creditors (id, party_name, contact_person, contact_phone, credit_limit)
       VALUES ($1, $2, $3, $4, $5)`,
      [creditor1Id, 'ABC Trucking', 'John Smith', '555-1111', 5000]
    );
    
    await executeQuery(
      `INSERT INTO public.creditors (id, party_name, contact_person, contact_phone, credit_limit)
       VALUES ($1, $2, $3, $4, $5)`,
      [creditor2Id, 'XYZ Logistics', 'Jane Doe', '555-2222', 10000]
    );
    
    // Step 12: Create some sample sales
    console.log('Creating sample sales');
    
    // Update nozzle reading first
    await executeQuery(
      `UPDATE public.nozzles SET current_reading = 100 WHERE id = $1`,
      [nozzle1Id]
    );
    
    // Record nozzle reading
    await executeQuery(
      `INSERT INTO public.nozzle_readings (nozzle_id, reading, recorded_by)
       VALUES ($1, $2, $3)`,
      [nozzle1Id, 100, employeeId]
    );
    
    // Create a cash sale
    await executeQuery(
      `INSERT INTO public.sales (
        id, station_id, nozzle_id, user_id, recorded_at, sale_volume, 
        cumulative_reading, previous_reading, fuel_price, cash_received,
        payment_method, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        uuidv4(), station1Id, nozzle1Id, employeeId, new Date(), 25,
        100, 75, 3.99, 99.75, 'cash', 'posted'
      ]
    );
    
    // Update nozzle reading again
    await executeQuery(
      `UPDATE public.nozzles SET current_reading = 130 WHERE id = $1`,
      [nozzle1Id]
    );
    
    // Create a credit sale
    await executeQuery(
      `INSERT INTO public.sales (
        id, station_id, nozzle_id, user_id, recorded_at, sale_volume, 
        cumulative_reading, previous_reading, fuel_price, credit_given,
        payment_method, credit_party_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        uuidv4(), station1Id, nozzle1Id, employeeId, new Date(), 30,
        130, 100, 3.99, 119.70, 'credit', creditor1Id, 'posted'
      ]
    );
    
    // Update creditor balance
    await executeQuery(
      `UPDATE public.creditors SET running_balance = 119.70, last_updated_at = NOW() WHERE id = $1`,
      [creditor1Id]
    );
    
    // Step 13: Create a shift
    const shiftId = uuidv4();
    
    console.log('Creating shift');
    
    await executeQuery(
      `INSERT INTO public.shifts (id, station_id, user_id, opening_cash, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [shiftId, station1Id, employeeId, 1000, 'open']
    );
    
    // Step 14: Create tender entries
    console.log('Creating tender entries');
    
    await executeQuery(
      `INSERT INTO public.tender_entries (id, shift_id, station_id, user_id, tender_type, amount)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), shiftId, station1Id, employeeId, 'cash', 250]
    );
    
    await executeQuery(
      `INSERT INTO public.tender_entries (id, shift_id, station_id, user_id, tender_type, amount)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), shiftId, station1Id, employeeId, 'card', 350]
    );
    
    // Step 15: Create day reconciliation
    console.log('Creating day reconciliation');
    
    await executeQuery(
      `INSERT INTO public.day_reconciliations (
        station_id, date, total_sales, cash_total, credit_total, 
        card_total, upi_total, finalized, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        station1Id, new Date(), 219.45, 99.75, 119.70,
        0, 0, true, managerId
      ]
    );
    
    // Step 16: Copy data to tenant schemas
    console.log('Copying data to tenant schemas');
    
    // Get tenant schema name
    const schemaName = `tenant_${tenant1Id.replace(/-/g, '_')}`;
    
    // Copy users
    await executeQuery(
      `INSERT INTO "${schemaName}".users
       SELECT * FROM public.users
       WHERE tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy stations
    await executeQuery(
      `INSERT INTO "${schemaName}".stations
       SELECT * FROM public.stations
       WHERE tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy user_stations
    await executeQuery(
      `INSERT INTO "${schemaName}".user_stations
       SELECT us.* FROM public.user_stations us
       JOIN public.users u ON us.user_id = u.id
       WHERE u.tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy pumps
    await executeQuery(
      `INSERT INTO "${schemaName}".pumps
       SELECT p.* FROM public.pumps p
       JOIN public.stations s ON p.station_id = s.id
       WHERE s.tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy nozzles
    await executeQuery(
      `INSERT INTO "${schemaName}".nozzles
       SELECT n.* FROM public.nozzles n
       JOIN public.pumps p ON n.pump_id = p.id
       JOIN public.stations s ON p.station_id = s.id
       WHERE s.tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy nozzle_readings
    await executeQuery(
      `INSERT INTO "${schemaName}".nozzle_readings
       SELECT nr.* FROM public.nozzle_readings nr
       JOIN public.nozzles n ON nr.nozzle_id = n.id
       JOIN public.pumps p ON n.pump_id = p.id
       JOIN public.stations s ON p.station_id = s.id
       WHERE s.tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy creditors
    await executeQuery(
      `INSERT INTO "${schemaName}".creditors
       SELECT * FROM public.creditors`,
      []
    );
    
    // Copy fuel_price_history
    await executeQuery(
      `INSERT INTO "${schemaName}".fuel_price_history
       SELECT fph.* FROM public.fuel_price_history fph
       JOIN public.stations s ON fph.station_id = s.id
       WHERE s.tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy sales
    await executeQuery(
      `INSERT INTO "${schemaName}".sales
       SELECT s.* FROM public.sales s
       JOIN public.stations st ON s.station_id = st.id
       WHERE st.tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy shifts
    await executeQuery(
      `INSERT INTO "${schemaName}".shifts
       SELECT sh.* FROM public.shifts sh
       JOIN public.stations s ON sh.station_id = s.id
       WHERE s.tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy tender_entries
    await executeQuery(
      `INSERT INTO "${schemaName}".tender_entries
       SELECT te.* FROM public.tender_entries te
       JOIN public.stations s ON te.station_id = s.id
       WHERE s.tenant_id = $1`,
      [tenant1Id]
    );
    
    // Copy day_reconciliations
    await executeQuery(
      `INSERT INTO "${schemaName}".day_reconciliations
       SELECT dr.* FROM public.day_reconciliations dr
       JOIN public.stations s ON dr.station_id = s.id
       WHERE s.tenant_id = $1`,
      [tenant1Id]
    );
    
    // Step 17: Validate the seed data
    console.log('Validating seed data');
    
    // Check if owner has at least one station
    const ownerStationResult = await executeQuery(
      `SELECT COUNT(*) FROM public.user_stations
       WHERE user_id = $1 AND role = 'owner'`,
      [ownerId]
    );
    
    const ownerStationCount = parseInt(ownerStationResult.rows[0].count);
    console.log(`Owner has ${ownerStationCount} stations`);
    
    if (ownerStationCount === 0) {
      console.error('❌ Validation failed: Owner does not have any stations');
    } else {
      console.log('✅ Validation passed: Owner has at least one station');
    }
    
    // Check if each station has at least one pump
    const stationPumpResult = await executeQuery(
      `SELECT s.id, s.name, COUNT(p.id) as pump_count
       FROM public.stations s
       LEFT JOIN public.pumps p ON s.id = p.station_id
       WHERE s.tenant_id = $1
       GROUP BY s.id, s.name`,
      [tenant1Id]
    );
    
    console.log('Station pump counts:');
    let allStationsHavePumps = true;
    
    for (const row of stationPumpResult.rows) {
      const pumpCount = parseInt(row.pump_count);
      console.log(`Station ${row.name}: ${pumpCount} pumps`);
      
      if (pumpCount === 0) {
        console.error(`❌ Validation failed: Station ${row.name} does not have any pumps`);
        allStationsHavePumps = false;
      }
    }
    
    if (allStationsHavePumps) {
      console.log('✅ Validation passed: All stations have at least one pump');
    }
    
    // Check if each pump has at least two nozzles
    const pumpNozzleResult = await executeQuery(
      `SELECT p.id, p.name, s.name as station_name, COUNT(n.id) as nozzle_count
       FROM public.pumps p
       JOIN public.stations s ON p.station_id = s.id
       LEFT JOIN public.nozzles n ON p.id = n.pump_id
       WHERE s.tenant_id = $1
       GROUP BY p.id, p.name, s.name`,
      [tenant1Id]
    );
    
    console.log('Pump nozzle counts:');
    let allPumpsHaveEnoughNozzles = true;
    
    for (const row of pumpNozzleResult.rows) {
      const nozzleCount = parseInt(row.nozzle_count);
      console.log(`Pump ${row.name} at ${row.station_name}: ${nozzleCount} nozzles`);
      
      if (nozzleCount < 2) {
        console.error(`❌ Validation failed: Pump ${row.name} at ${row.station_name} has less than 2 nozzles`);
        allPumpsHaveEnoughNozzles = false;
      }
    }
    
    if (allPumpsHaveEnoughNozzles) {
      console.log('✅ Validation passed: All pumps have at least 2 nozzles');
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function
seed().catch(console.error);