#!/usr/bin/env ts-node
import { PoolClient } from 'pg';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import pool from '../dbPool';

const uuid = () => randomUUID();
const rnd  = (min: number, max: number, precision: number = 2): number => {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(precision));
};

const FUEL_TYPES    = ['petrol','diesel','premium','super','cng','lpg'] as const;
const PAYMENT_METHS = ['cash','card','upi','credit','mixed'] as const;

export async function generateDemoSales(
  client: PoolClient,
  stations: { id: string }[],
  empIds: string[],
  days: number = 30,
  saleCount?: number
) {
  const { rows: nozzles } = await client.query(`
    SELECT n.id, n.current_reading, p.station_id, n.fuel_type
    FROM nozzles n
    JOIN pumps p ON p.id = n.pump_id
  `);

  const { rows: prices } = await client.query(`
    SELECT station_id,
           fuel_type,
           CAST(price_per_unit AS NUMERIC(10,3)) as price_per_unit
    FROM fuel_prices
    WHERE active
  `);

  const priceMap = new Map(
    prices.map(r => [`${r.station_id}_${r.fuel_type}`, r.price_per_unit])
  );

  const totalSales = saleCount ?? stations.length * days * 2;
  let made = 0;

  for (const dayOffset of [...Array(days).keys()]) {
    const baseTs = Math.floor(Date.now() / 1000) - dayOffset * 86400;
    for (const { id: stId } of stations) {
      const stationNozzles = nozzles.filter(n => n.station_id === stId);
      for (let k = 0; k < 2 && made < totalSales; k++) {
        made++;
        const nozzle = stationNozzles[Math.floor(Math.random() * stationNozzles.length)];
        const saleTime = new Date((baseTs + k * 300) * 1000).toISOString();

        await client.query(
          `WITH sale_data AS (
             SELECT
               CAST($4 AS NUMERIC(12,3)) as volume,
               CAST($5 AS NUMERIC(10,3)) as price,
               CAST($6 AS NUMERIC(12,3)) as prev_reading
           ),
           calc_data AS (
             SELECT
               volume,
               price,
               prev_reading,
               prev_reading + volume as cum_reading
             FROM sale_data
           )
           INSERT INTO sales (
            id, station_id, nozzle_id, tenant_id, user_id, recorded_at,
            sale_volume, fuel_price,
            previous_reading, cumulative_reading,
            payment_method, status, notes
          )
          SELECT
            $1, $2, $3, $10, $7, $8,
            volume, price,
            prev_reading, cum_reading,
            $9::payment_method, 'posted'::sale_status, NULL
          FROM calc_data
          RETURNING id`,
          [
            uuid(),
            stId,
            nozzle.id,
            rnd(5, 50, 3),
            priceMap.get(`${stId}_${nozzle.fuel_type}`),
            nozzle.current_reading,
            empIds[Math.floor(Math.random() * empIds.length)],
            saleTime,
            PAYMENT_METHS[Math.floor(Math.random() * PAYMENT_METHS.length)],
            tenantId
          ]
        );
      }
    }
  }
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1️⃣ admin_users (superadmin without tenant)
    console.log('👤 Seeding admin_users…');
    const adminId = uuid();
    const adminPw = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO admin_users
         (id,email,password_hash,role,first_name,last_name,active)
       VALUES ($1,$2,$3,'superadmin','System','Admin',TRUE)`,
      [adminId, 'admin@fuelsync.com', adminPw]
    );
    console.log(`   ↳ Created admin user with ID: ${adminId}`);

    // 2️⃣ Create tenant first
    console.log('🏢 Creating tenant…');
    const tenantId = uuid();
    await client.query(`
      INSERT INTO tenants 
        (id, name, email, subscription_plan, status, contact_person, contact_phone, city, state)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        tenantId,
        'Demo Company',
        'contact@democompany.com',
        'basic',
        'active',
        'John Owner',
        '555-0000',
        'Fueltown',
        'State'
      ]
    );
    console.log(`   ↳ Created tenant with ID: ${tenantId}`);

    // 3️⃣ Create users with tenant_id
    console.log('👥 Seeding users…');
    const ownerId   = uuid();
    const managerId = uuid();
    const empIds    = [uuid(), uuid(), uuid()];
    const [oPw, mPw, e1pw, e2pw, e3pw] = await Promise.all([
      bcrypt.hash('owner123',10),
      bcrypt.hash('manager123',10),
      bcrypt.hash('employee1',10),
      bcrypt.hash('employee2',10),
      bcrypt.hash('employee3',10)
    ]);

    await client.query(`
      INSERT INTO users
        (id,email,password_hash,role,first_name,last_name,tenant_id,active)
      VALUES
        ($1,'owner@test.com',$2,'owner','John','Owner',$3,TRUE),
        ($4,'manager@test.com',$5,'manager','Jane','Manager',$6,TRUE),
        ($7,'emp1@test.com',$8,'employee','Emp','One',$9,TRUE),
        ($10,'emp2@test.com',$11,'employee','Emp','Two',$12,TRUE),
        ($13,'emp3@test.com',$14,'employee','Emp','Three',$15,TRUE)`,
      [
        ownerId,   oPw,  tenantId,
        managerId, mPw,  tenantId,
        empIds[0], e1pw, tenantId,
        empIds[1], e2pw, tenantId,
        empIds[2], e3pw, tenantId
      ]
    );
    console.log(
      `   ↳ Created users: owner=${ownerId}, manager=${managerId}, employees=${empIds.join(', ')}`
    );

    // 4️⃣ stations
    console.log('⛽ Seeding stations…');
    const stationNames = ['Alpha','Bravo'];
    const stations = stationNames.map(name => ({ id: uuid(), name }));
    
    for (const { id: stId, name } of stations) {
      await client.query(
        `INSERT INTO stations
           (id,tenant_id,name,address,city,state,zip,contact_phone)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          stId,
          tenantId,
          `${name} Station`,
          `${name} Ave`,
          'Fueltown',
          'State',
          '00000',
          '555-0000'
        ]
      );
      console.log(`   ↳ Station ${name} created with ID: ${stId}`);

      // 5️⃣ user_stations
      await client.query(
        `INSERT INTO user_stations
           (id,user_id,station_id,role,active)
         VALUES
           ($1,$2,$3,'owner',TRUE),
           ($4,$5,$6,'manager',TRUE)`,
        [ uuid(), ownerId, stId,
          uuid(), managerId, stId ]
      );
      console.log(`     • Assigned owner ${ownerId} and manager ${managerId} to station ${stId}`);

      for (const empId of empIds) {
        await client.query(
          `INSERT INTO user_stations
             (id,user_id,station_id,role,active)
           VALUES ($1,$2,$3,'attendant',TRUE)`,
          [ uuid(), empId, stId ]
        );
        console.log(`       - Assigned employee ${empId} to station ${stId}`);
      }

      // 6️⃣ pumps + nozzles
      for (let i = 1; i <= 3; i++) {
        const pumpId = uuid();
        await client.query(
          `INSERT INTO pumps
             (id,station_id,tenant_id,name,serial_number,installation_date,active)
           VALUES ($1,$2,$3,$4,$5,CURRENT_DATE - INTERVAL '1 year',TRUE)`,
          [ pumpId, stId, tenantId, `Pump ${i}`, `SN${Math.floor(Math.random()*90000)+10000}` ]
        );
        console.log(`       - Pump ${i} created with ID: ${pumpId} for station ${stId}`);
        for (let n = 0; n < 2; n++) {
          const nozId = uuid();
          const init  = n * 1000;
          await client.query(
            `INSERT INTO nozzles
               (id,pump_id,tenant_id,fuel_type,initial_reading,current_reading,active)
             VALUES ($1,$2,$3,$4,$5,$5,TRUE)`,
            [ nozId, pumpId, tenantId, FUEL_TYPES[n], init ]
          );
          console.log(`         ↳ Nozzle ${nozId} (${FUEL_TYPES[n]}) added to pump ${pumpId}`);
        }
      }

      // 7️⃣ fuel_prices
      for (const fuel of FUEL_TYPES) {
        await client.query(
          `INSERT INTO fuel_prices
             (id,station_id,tenant_id,fuel_type,price_per_unit,effective_from,created_by,active)
           VALUES ($1,$2,$3,$4,$5,CURRENT_DATE,$6,TRUE)`,
          [ uuid(), stId, tenantId, fuel, rnd(2.5,4), ownerId ]
        );
        console.log(`       - Price set for ${fuel} at station ${stId}`);
      }
    }

    // 7️⃣➕ Create creditors
    console.log('💳 Seeding creditors…');
    const creditorData = [
      { name: 'ABC Trucking', contact: 'John Smith', phone: '555-1111', limit: 5000 },
      { name: 'XYZ Logistics', contact: 'Jane Doe', phone: '555-2222', limit: 10000 },
    ];
    for (const c of creditorData) {
      const credId = uuid();
      await client.query(
        `INSERT INTO creditors (id, station_id, tenant_id, party_name, contact_person, contact_phone, credit_limit)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [credId, stations[0].id, tenantId, c.name, c.contact, c.phone, c.limit]
      );
      console.log(`   ↳ Creditor ${c.name} inserted with ID: ${credId}`);
    }

    // 8️⃣ demo sales (skip if requested)
    if (!process.argv.includes('--skip-sales')) {
      console.log('💵 Generating demo sales…');
      const saleArg = process.argv.find(a => a.startsWith('--sales='));
      const saleCount = saleArg ? Number(saleArg.split('=')[1]) : undefined;
      await generateDemoSales(client, stations, empIds, 30, saleCount);
      console.log(`   ↳ Demo sales generated${saleCount ? ` (${saleCount} records)` : ''}`);
    }

    await client.query('COMMIT');
    console.log('✅ Seed complete — log in as owner@test.com/owner123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
