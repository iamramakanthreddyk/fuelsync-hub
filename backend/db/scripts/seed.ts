// backend/scripts/seed.ts
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto'; // Using Node's built-in UUID generator
import fs from 'fs';
import path from 'path';

dotenv.config();

// Helper function to generate UUID
const generateUUID = () => randomUUID();

const pool = new Pool({
  host: process.env.DB_HOST || 'fuelsync-server.postgres.database.azure.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'fueladmin',
  password: process.env.DB_PASSWORD || 'Th1nkpad!2304',
  database: process.env.DB_NAME || 'fuelsync_db',
  ssl: {
    rejectUnauthorized: false
  }
});

// Sample data
const FUEL_TYPES = ['petrol', 'diesel', 'premium', 'super', 'cng', 'lpg'];
const PAYMENT_METHODS = ['cash', 'credit', 'card', 'upi', 'mixed'];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting seed process...');
    await client.query('SET search_path TO public');

    // Optionally clean tables for a fresh start
    await client.query('TRUNCATE TABLE user_sessions, sales, nozzles, pumps, stations, user_stations, creditors, credit_payments, fuel_prices, day_reconciliations, users RESTART IDENTITY CASCADE');

    // Create users
    console.log('Creating users...');
    type UserSeed = { id: string; email: string; role: string; name: string };
    const users: UserSeed[] = [];

    // Owner
    const ownerPassword = await bcrypt.hash('owner123', 10);
    const ownerId = generateUUID();
    await client.query(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, active)
      VALUES ($1, 'owner@test.com', $2, 'owner', 'John', 'Owner', '555-1234', true)
    `, [ownerId, ownerPassword]);
    users.push({ id: ownerId, email: 'owner@test.com', role: 'owner', name: 'John Owner' });

    // Manager
    const managerPassword = await bcrypt.hash('manager123', 10);
    const managerId = generateUUID();
    await client.query(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, active)
      VALUES ($1, 'manager@test.com', $2, 'manager', 'Jane', 'Manager', '555-2345', true)
    `, [managerId, managerPassword]);
    users.push({ id: managerId, email: 'manager@test.com', role: 'manager', name: 'Jane Manager' });

    type EmployeeSeed = { id: string; email: string; name: string };
    const employees: EmployeeSeed[] = [];
    for (let i = 1; i <= 3; i++) {
      const employeeId = generateUUID();
      const employeePassword = await bcrypt.hash(`employee${i}`, 10);
      await client.query(`
        INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, active)
        VALUES ($1, $2, $3, 'employee', $4, 'Employee', $5, true)
      `, [
        employeeId,
        `employee${i}@test.com`,
        employeePassword,
        `Employee${i}`,
        `555-${3000 + i}`
      ]);
      
      employees.push({
        id: employeeId,
        email: `employee${i}@test.com`,
        name: `Employee${i} Employee`
      });
      users.push({ id: employeeId, email: `employee${i}@test.com`, role: 'employee', name: `Employee${i} Employee` });
    }
    
    // Create subscription
    console.log('Creating subscription...');
    const subscriptionId = generateUUID();
    await client.query(`
      INSERT INTO subscription (id, plan_id, status, subscribed_at, expires_at, is_trial)
      VALUES ($1, 'enterprise', 'active', NOW(), NOW() + INTERVAL '1 year', false)
    `, [subscriptionId]);
    
    // Create tenant settings
    console.log('Creating tenant settings...');
    const settingsId = generateUUID();
    await client.query(`
      INSERT INTO tenant_settings (id, timezone, currency, date_format, theme)
      VALUES ($1, 'UTC', 'USD', 'YYYY-MM-DD', 'light')
    `, [settingsId]);
    
    // Create stations
    console.log('Creating stations...');
    type StationSeed = { id: string; name: string };
    const stations: StationSeed[] = [];
    
    const stationNames = [
      'Main Street Station',
      'Highway 95 Station',
      'Downtown Station'
    ];
    
    for (let i = 0; i < stationNames.length; i++) {
      const stationId = generateUUID();
      await client.query(`
        INSERT INTO stations (
          id, name, address, city, state, zip, contact_phone, 
          location, operating_hours, active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      `, [
        stationId,
        stationNames[i],
        `${1000 + i} ${stationNames[i].split(' ')[0]} St`,
        'Fueltown',
        'State',
        `1000${i}`,
        `555-${4000 + i}`,
        JSON.stringify({ latitude: 40 + (i * 0.1), longitude: -74 - (i * 0.1) }),
        JSON.stringify({
          monday: { open: '06:00', close: '22:00' },
          tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' },
          thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' },
          saturday: { open: '07:00', close: '21:00' },
          sunday: { open: '07:00', close: '21:00' }
        })
      ]);
      
      stations.push({
        id: stationId,
        name: stationNames[i]
      });
      
      // Assign manager to first station, employees to all stations
      if (i === 0) {
        const userStationId = generateUUID();
        await client.query(`
          INSERT INTO user_stations (id, user_id, station_id, role, active)
          VALUES ($1, $2, $3, 'manager', true)
        `, [userStationId, managerId, stationId]);
      }
      
      // Assign employees to stations (round-robin)
      const employeeIdx = i % employees.length;
      const userStationId = generateUUID();
      await client.query(`
        INSERT INTO user_stations (id, user_id, station_id, role, active)
        VALUES ($1, $2, $3, 'attendant', true)
      `, [userStationId, employees[employeeIdx].id, stationId]);
    }
    
    // Create pumps and nozzles
    console.log('Creating pumps and nozzles...');
    
    for (const station of stations) {
      // Each station gets 2-4 pumps
      const numPumps = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 1; i <= numPumps; i++) {
        const pumpId = generateUUID();
        await client.query(`
          INSERT INTO pumps (
            id, station_id, name, serial_number, installation_date, active
          )
          VALUES ($1, $2, $3, $4, $5, true)
        `, [
          pumpId,
          station.id,
          `Pump ${i}`,
          `SN${Math.floor(Math.random() * 10000)}`,
          new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
        ]);
        
        // Each pump gets 2-3 nozzles with different fuel types
        const pumpFuelTypes = [...FUEL_TYPES].sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2));
        
        for (const fuelType of pumpFuelTypes) {
          const nozzleId = generateUUID();
          const initialReading = Math.floor(Math.random() * 5000);
          await client.query(`
            INSERT INTO nozzles (
              id, pump_id, fuel_type, initial_reading, current_reading, active
            )
            VALUES ($1, $2, $3, $4, $5, true)
          `, [
            nozzleId,
            pumpId,
            fuelType,
            initialReading,
            initialReading + Math.floor(Math.random() * 2000)
          ]);
          
          // Set fuel prices for each fuel type at each station
          const priceId = generateUUID();
          await client.query(`
            INSERT INTO fuel_prices (
              id, station_id, fuel_type, price_per_unit, effective_from, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            priceId,
            station.id,
            fuelType,
            (2.5 + Math.random() * 3).toFixed(2), // Random price between 2.50 and 5.50
            new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 days ago
            ownerId
          ]);
        }
      }
    }
    
    // Create creditors
    console.log('Creating creditors...');
    type CreditorSeed = { id: string; stationId: string; name: string };
    const creditors: CreditorSeed[] = [];
    
    for (const station of stations) {
      // Each station gets 2-3 creditors
      const numCreditors = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 1; i <= numCreditors; i++) {
        const creditorId = generateUUID();
        await client.query(`
          INSERT INTO creditors (
            id, station_id, party_name, party_contact, running_balance, 
            credit_limit, active
          )
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [
          creditorId,
          station.id,
          `Creditor ${station.name.split(' ')[0]} ${i}`,
          `555-${6000 + parseInt(station.id.substr(0, 2), 16) + i}`,
          0, // Initial balance is 0
          1000 + Math.floor(Math.random() * 4000) // Credit limit between 1000 and 5000
        ]);
        
        creditors.push({
          id: creditorId,
          stationId: station.id,
          name: `Creditor ${station.name.split(' ')[0]} ${i}`
        });
      }
    }
    
    // Create sales data
    console.log('Creating sales data...');
    
    // Get all nozzles
    const nozzlesResult = await client.query(`
      SELECT n.id, n.pump_id, n.fuel_type, n.current_reading, p.station_id
      FROM nozzles n
      JOIN pumps p ON n.pump_id = p.id
      WHERE n.active = true
    `);
    
    const nozzles = nozzlesResult.rows;
    
    // Get all fuel prices
    const pricesResult = await client.query(`
      SELECT station_id, fuel_type, price_per_unit
      FROM fuel_prices
      WHERE effective_to IS NULL OR effective_to > NOW()
    `);
    
    const fuelPrices = pricesResult.rows.reduce((acc, price) => {
      const key = `${price.station_id}_${price.fuel_type}`;
      acc[key] = parseFloat(price.price_per_unit);
      return acc;
    }, {});
    
    // Create sales for the last 30 days
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
    
    // For each day
    for (let date = new Date(startDate); date <= today; date.setDate(date.getDate() + 1)) {
      // For each station
      for (const station of stations) {
        // Get station's nozzles
        const stationNozzles = nozzles.filter(n => n.station_id === station.id);
        
        // Get employees assigned to this station
        const stationEmployeesResult = await client.query(`
          SELECT us.user_id
          FROM user_stations us
          WHERE us.station_id = $1 AND us.active = true
        `, [station.id]);
        
        const stationEmployees = stationEmployeesResult.rows.map(row => row.user_id);
        if (stationEmployees.length === 0) continue;
        
        // Get creditors for this station
        const stationCreditors = creditors.filter(c => c.stationId === station.id);
        
        // Generate 5-20 sales per day per station
        const numSales = 5 + Math.floor(Math.random() * 16);
        
        for (let i = 0; i < numSales; i++) {
          // Pick a random nozzle
          const nozzle = stationNozzles[Math.floor(Math.random() * stationNozzles.length)];
          if (!nozzle) continue;
          
          // Pick a random employee
          const employeeId = stationEmployees[Math.floor(Math.random() * stationEmployees.length)];
          
          // Set the time for this sale (random time during the day)
          const saleDate = new Date(date);
          saleDate.setHours(6 + Math.floor(Math.random() * 16)); // Between 6 AM and 10 PM
          saleDate.setMinutes(Math.floor(Math.random() * 60));
          saleDate.setSeconds(Math.floor(Math.random() * 60));
          
          // Sale volume between 5 and 50 liters
          const saleVolume = parseFloat((5 + Math.random() * 45).toFixed(2));
          
          // Get fuel price
          const priceKey = `${station.id}_${nozzle.fuel_type}`;
          const fuelPrice = parseFloat((fuelPrices[priceKey] || 3.5).toFixed(2));
          
          // Calculate amount (precise 2 decimal calculation)
          const amount = parseFloat((saleVolume * fuelPrice).toFixed(2));
          
          // Determine payment method
          let paymentMethod = 'cash';
          let cashReceived = amount;
          let creditGiven = 0;
          let creditPartyId: string | null = null;
          
          const paymentRoll = Math.random();
          if (paymentRoll > 0.85) {
            paymentMethod = 'card';
          } else if (paymentRoll > 0.7) {
            paymentMethod = 'credit';
            cashReceived = 0;
            creditGiven = amount;
            // Assign to a random creditor
            if (stationCreditors.length > 0) {
              creditPartyId = stationCreditors[Math.floor(Math.random() * stationCreditors.length)].id;
            }
          } else if (paymentRoll > 0.65) {
            paymentMethod = 'upi';
          } else if (paymentRoll > 0.60 && stationCreditors.length > 0) {
            // Mixed payment (cash + credit)
            paymentMethod = 'mixed';
            // Split between cash and credit - ensure exact amount
            const creditRatio = 0.3 + Math.random() * 0.4; // 30-70% on credit
            creditGiven = parseFloat((amount * creditRatio).toFixed(2));
            cashReceived = parseFloat((amount - creditGiven).toFixed(2));
            
            // Assign to a random creditor
            creditPartyId = stationCreditors[Math.floor(Math.random() * stationCreditors.length)].id;
          }
          
          try {
            // Verify the constraint before inserting
            if (Math.abs((cashReceived + creditGiven) - amount) > 0.001) {
              console.log(`Fixing payment amounts: ${cashReceived} + ${creditGiven} ≠ ${amount}`);
              // Fix the amounts to ensure they add up
              cashReceived = parseFloat((amount - creditGiven).toFixed(2));
            }
            
            // Create the sale record
            const saleId = generateUUID();
            await client.query(`
              INSERT INTO sales (
                id, station_id, nozzle_id, user_id, recorded_at, sale_volume, 
                cumulative_reading, previous_reading, fuel_price, amount, 
                cash_received, credit_given, payment_method, credit_party_id, status
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'posted')
            `, [
              saleId,
              station.id,
              nozzle.id,
              employeeId,
              saleDate.toISOString(),
              saleVolume.toFixed(2),
              (parseFloat(nozzle.current_reading) + saleVolume).toFixed(2),
              nozzle.current_reading,
              fuelPrice.toFixed(2),
              amount.toFixed(2),
              cashReceived.toFixed(2),
              creditGiven.toFixed(2),
              paymentMethod,
              creditPartyId
            ]);
            
            // Update nozzle reading
            await client.query(`
              UPDATE nozzles
              SET current_reading = $1
              WHERE id = $2
            `, [
              (parseFloat(nozzle.current_reading) + saleVolume).toFixed(2),
              nozzle.id
            ]);
            
            // Update nozzle's current_reading for future sales
            nozzle.current_reading = (parseFloat(nozzle.current_reading) + saleVolume).toFixed(2);
            
            // If credit was given, update creditor balance
            if (creditGiven > 0 && creditPartyId) {
              await client.query(`
                UPDATE creditors
                SET running_balance = running_balance + $1, last_updated_at = NOW()
                WHERE id = $2
              `, [creditGiven.toFixed(2), creditPartyId]);
            }
          } catch (error) {
            const err = error as Error;
            console.error('Error creating sale:', err.message);
            console.log('Sale data:', {
              stationId: station.id,
              nozzleId: nozzle.id,
              saleVolume,
              fuelPrice,
              amount,
              cashReceived,
              creditGiven,
              paymentMethod,
              creditPartyId,
              check: parseFloat((cashReceived + creditGiven).toFixed(2)) === amount
            });
            // Continue with other sales
          }
        }
        
        // Create day reconciliation for days before today
        if (date < today) {
          try {
            // Get sales totals for the day
            const totalsResult = await client.query(`
              SELECT 
                COALESCE(SUM(amount), 0) as total_sales,
                COALESCE(SUM(cash_received), 0) as cash_total,
                COALESCE(SUM(credit_given), 0) as credit_total
              FROM sales
              WHERE station_id = $1 
                AND DATE(recorded_at) = $2
                AND status = 'posted'
            `, [station.id, date.toISOString().split('T')[0]]);
            
            const totals = totalsResult.rows[0];
            
            // Only create reconciliation if there were sales
            if (parseFloat(totals.total_sales) > 0) {
              // Calculate card and UPI totals
              const totalSales = parseFloat(totals.total_sales);
              const cashTotal = parseFloat(totals.cash_total);
              const creditTotal = parseFloat(totals.credit_total);
              
              // Remainder for card and UPI
              const remainder = parseFloat((totalSales - cashTotal - creditTotal).toFixed(2));
              
              // Split between card (75%) and UPI (25%)
              let cardTotal = parseFloat((remainder * 0.75).toFixed(2));
              let upiTotal = parseFloat((remainder * 0.25).toFixed(2));
              
              // Ensure exact totals (handle any floating-point issues)
              if (Math.abs((cashTotal + creditTotal + cardTotal + upiTotal) - totalSales) > 0.001) {
                // Adjust card total to ensure exact match
                cardTotal = parseFloat((totalSales - cashTotal - creditTotal - upiTotal).toFixed(2));
              }
              
              const reconciliationId = generateUUID();
              await client.query(`
                INSERT INTO day_reconciliations (
                  id, station_id, date, total_sales, cash_total, credit_total,
                  card_total, upi_total, finalized, created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
              `, [
                reconciliationId,
                station.id,
                date.toISOString().split('T')[0],
                totalSales.toFixed(2),
                cashTotal.toFixed(2),
                creditTotal.toFixed(2),
                cardTotal.toFixed(2),
                upiTotal.toFixed(2),
                managerId // Manager did the reconciliation
              ]);
            }
          } catch (error) {
            const err = error as Error;
            console.error('Error creating reconciliation:', err.message);
            // Continue with other days
          }
        }
      }
    }
    
    // Create some credit payments for settled debts
    console.log('Creating credit payments...');
    
    // Get creditors with balances
    const creditorsResult = await client.query(`
      SELECT id, station_id, party_name, running_balance
      FROM creditors
      WHERE running_balance > 0
    `);
    
    for (const creditor of creditorsResult.rows) {
      // 50% chance of making a payment
      if (Math.random() > 0.5) {
        const balance = parseFloat(creditor.running_balance);
        
        // Pay between 20% and 100% of balance
        const paymentPercentage = 0.2 + Math.random() * 0.8;
        const paymentAmount = parseFloat((balance * paymentPercentage).toFixed(2));
        
        // Random payment date in the last 7 days
        const paymentDate = new Date();
        paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 7));
        
        // Random payment method
        const paymentMethods = ['cash', 'card', 'upi', 'bank_transfer'];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        // Get a manager or employee for the station
        const userResult = await client.query(`
          SELECT us.user_id
          FROM user_stations us
          WHERE us.station_id = $1 AND us.active = true
          ORDER BY RANDOM()
          LIMIT 1
        `, [creditor.station_id]);
        
        if (userResult.rows.length > 0) {
          try {
            const receivedBy = userResult.rows[0].user_id;
            
            // Create payment record
            const paymentId = generateUUID();
            await client.query(`
              INSERT INTO credit_payments (
                id, creditor_id, amount, paid_at, payment_method, received_by
              )
              VALUES ($1, $2, $3, $4, $5, $6)
            `, [
              paymentId,
              creditor.id,
              paymentAmount.toFixed(2),
              paymentDate.toISOString(),
              paymentMethod,
              receivedBy
            ]);
            
            // Update creditor balance
            await client.query(`
              UPDATE creditors
              SET running_balance = running_balance - $1, last_updated_at = NOW()
              WHERE id = $2
            `, [paymentAmount.toFixed(2), creditor.id]);
          } catch (error) {
            const err = error as Error;
            console.error('Error creating credit payment:', err.message);
          }
        }
      }
    }
    
    console.log('Seed completed successfully!');
    console.log('You can now log in with the following users:');
    console.log('  Owner: owner@test.com / owner123');
    console.log('  Manager: manager@test.com / manager123');
    console.log('  Employees: employee1@test.com / employee1, etc.');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
seed().catch(err => {
  console.error('Failed to run seed:', err);
  process.exit(1);
});