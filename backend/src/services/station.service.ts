// src/services/station.service.ts
import pool from '../config/database';

export const createStation = async (
  schemaName: string,
  name: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  contactPhone: string,
  location: any,
  operatingHours: any
) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Create station
    const result = await client.query(
      `INSERT INTO stations (name, address, city, state, zip, contact_phone, location, operating_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, address, city, state, zip, contact_phone, active, created_at`,
      [name, address, city, state, zip, contactPhone, JSON.stringify(location), JSON.stringify(operatingHours)]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating station:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getStations = async (schemaName: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Get all active stations
    const result = await client.query(
      `SELECT id, name, address, city, state, zip, contact_phone, active, created_at, updated_at
       FROM stations
       WHERE active = true
       ORDER BY name`
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting stations:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getStationById = async (schemaName: string, stationId: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Get station by ID
    const result = await client.query(
      `SELECT id, name, address, city, state, zip, contact_phone, location, operating_hours, active, created_at, updated_at
       FROM stations
       WHERE id = $1 AND active = true`,
      [stationId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting station:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateStation = async (
  schemaName: string,
  stationId: string,
  updates: any
) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Build update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
      .join(', ');
    
    const values = Object.values(updates);
    
    // Update station
    const result = await client.query(
      `UPDATE stations
       SET ${setClause}, updated_at = NOW()
       WHERE id = $1 AND active = true
       RETURNING id, name, address, city, state, zip, contact_phone, active, created_at, updated_at`,
      [stationId, ...values]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating station:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteStation = async (schemaName: string, stationId: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Soft delete station
    const result = await client.query(
      `UPDATE stations
       SET active = false, deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND active = true
       RETURNING id`,
      [stationId]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting station:', error);
    throw error;
  } finally {
    client.release();
  }
};