import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { withTransaction } from './db.service';
import { validateTenantHasStation, validateStationHasPump } from './hierarchyValidation.service';

export const getStations = async (tenantId?: string) => {
  const client = await pool.connect();
  try {
    let query = `
      SELECT id, name, address, city, state, zip, contact_phone, active, created_at, updated_at
      FROM public.stations
      WHERE active = true`;
    
    const values: any[] = [];
    
    if (tenantId) {
      query += ` AND tenant_id = $1`;
      values.push(tenantId);
    }
    
    query += ` ORDER BY name`;
    
    const result = await client.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error getting stations:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getStationById = async (stationId: string, tenantId?: string) => {
  const client = await pool.connect();
  try {
    let query = `
      SELECT id, name, address, city, state, zip, contact_phone, active, created_at, updated_at
      FROM public.stations
      WHERE id = $1 AND active = true`;
    
    const values: any[] = [stationId];
    
    if (tenantId) {
      query += ` AND tenant_id = $2`;
      values.push(tenantId);
    }
    
    const result = await client.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error getting station by ID:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const createStation = async (
  name: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  contactPhone: string,
  tenantId: string
) => {
  return withTransaction(null, async (client) => {
    const id = uuidv4();
    const query = `
      INSERT INTO public.stations (
        id, tenant_id, name, address, city, state, zip, contact_phone
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
      RETURNING id, name, address, city, state, zip, contact_phone, active, created_at
    `;

    const values = [id, tenantId, name, address, city, state, zip, contactPhone];
    const result = await client.query(query, values);

    await validateTenantHasStation(client, tenantId);
    await validateStationHasPump(client, id);

    return result.rows[0];
  });
};

export const updateStation = async (
  stationId: string,
  updates: Record<string, any>,
  tenantId?: string
) => {
  const client = await pool.connect();
  try {
    // Filter out updated_at from updates to avoid duplicate assignment
    const filteredUpdates = { ...updates };
    delete filteredUpdates.updated_at;
    
    const setClause = Object.keys(filteredUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [stationId, ...Object.values(filteredUpdates)];
    let query = `
      UPDATE public.stations
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND active = true`;
    
    if (tenantId) {
      query += ` AND tenant_id = $${values.length + 1}`;
      values.push(tenantId);
    }
    
    query += ` RETURNING id, tenant_id, name, address, city, state, zip, contact_phone, active, created_at, updated_at`;

    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      return null;
    }

    await validateTenantHasStation(client, tenantId || result.rows[0].tenant_id);
    await validateStationHasPump(client, stationId);

    return result.rows[0];
  } catch (error) {
    console.error('Error updating station:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteStation = async (stationId: string, tenantId?: string) => {
  const client = await pool.connect();
  try {
    let query = `
      UPDATE public.stations
      SET active = false, updated_at = NOW()
      WHERE id = $1 AND active = true`;
    
    const values: any[] = [stationId];
    
    if (tenantId) {
      query += ` AND tenant_id = $2`;
      values.push(tenantId);
    }
    
    query += ` RETURNING id, tenant_id`;

    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      return false;
    }

    const { tenant_id } = result.rows[0];
    await validateTenantHasStation(client, tenant_id);
    return true;
  } catch (error) {
    console.error('Error deleting station:', error);
    throw error;
  } finally {
    client.release();
  }
};