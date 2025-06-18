import { insertWithUUID, executeQuery } from './db.service';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const createStation = async (
  schemaName: string,
  name: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  contactPhone: string,
  location: any,
  operatingHours: any,
  tenantId?: string
) => {
  // Get tenant ID from the user if not provided
  if (!tenantId) {
    // Extract tenant ID from schema name (tenant_uuid format)
    tenantId = schemaName.replace('tenant_', '').replace(/_/g, '-');
  }

  return await insertWithUUID(
    schemaName,
    'stations',
    {
      name,
      address,
      city,
      state,
      zip,
      contact_phone: contactPhone,
      location: JSON.stringify(location),
      operating_hours: JSON.stringify(operatingHours),
      tenant_id: tenantId
    },
    'id, name, address, city, state, zip, contact_phone, active, created_at'
  );
};

export const createStationInPublic = async (
  name: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  contactPhone: string,
  location: any,
  operatingHours: any,
  tenantId: string,
  stationId?: string
) => {
  const client = await pool.connect();
  try {
    const id = stationId || uuidv4();
    const query = `
      INSERT INTO public.stations (
        id, tenant_id, name, address, city, state, zip, contact_phone, 
        location, operating_hours
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      ON CONFLICT (id) DO UPDATE SET
        name = $3,
        address = $4,
        city = $5,
        state = $6,
        zip = $7,
        contact_phone = $8,
        location = $9,
        operating_hours = $10,
        updated_at = NOW()
      RETURNING id, name, address, city, state, zip, contact_phone, active, created_at
    `;
    
    const values = [
      id,
      tenantId,
      name,
      address,
      city,
      state,
      zip,
      contactPhone,
      JSON.stringify(location),
      JSON.stringify(operatingHours)
    ];
    
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating station in public schema:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getStations = async (schemaName: string) => {
  const query = `
    SELECT id, name, address, city, state, zip, contact_phone, active, created_at, updated_at
    FROM stations
    WHERE active = true
    ORDER BY name`;

  const result = await executeQuery(schemaName, query);
  return result.rows;
};

export const getStationById = async (schemaName: string, stationId: string) => {
  const query = `
    SELECT id, name, address, city, state, zip, contact_phone, location, operating_hours, active, created_at, updated_at
    FROM stations
    WHERE id = $1 AND active = true`;

  const result = await executeQuery(schemaName, query, [stationId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const updateStation = async (
  schemaName: string,
  stationId: string,
  updates: Record<string, any>
) => {
  const setClause = Object.keys(updates)
    .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
    .join(', ');

  const values = Object.values(updates);
  const query = `
    UPDATE stations
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1 AND active = true
    RETURNING id, name, address, city, state, zip, contact_phone, active, created_at, updated_at`;

  const result = await executeQuery(schemaName, query, [stationId, ...values]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const deleteStation = async (schemaName: string, stationId: string) => {
  const query = `
    UPDATE stations
    SET active = false, deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND active = true
    RETURNING id`;

  const result = await executeQuery(schemaName, query, [stationId]);
  return result.rows.length > 0;
};

export const getStationsByCity = async (schemaName: string, city: string) => {
  const query = `
    SELECT id, name, address, city, state, zip, contact_phone, active, created_at, updated_at
    FROM stations
    WHERE city = $1 AND active = true
    ORDER BY name`;

  const result = await executeQuery(schemaName, query, [city]);
  return result.rows;
};