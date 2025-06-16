import pool from '../config/database';

export const createPump = async (
  schemaName: string,
  stationId: string,
  name: string,
  serialNumber: string,
  installationDate: string
) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Create pump
    const result = await client.query(
      `INSERT INTO pumps (station_id, name, serial_number, installation_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, station_id, name, serial_number, installation_date, active, created_at`,
      [stationId, name, serialNumber, installationDate]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating pump:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getPumpsByStationId = async (schemaName: string, stationId: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Get all active pumps for the station
    const result = await client.query(
      `SELECT id, station_id, name, serial_number, installation_date, active, created_at, updated_at
       FROM pumps
       WHERE station_id = $1 AND active = true
       ORDER BY name`,
      [stationId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting pumps:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getPumpById = async (schemaName: string, pumpId: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Get pump by ID
    const result = await client.query(
      `SELECT id, station_id, name, serial_number, installation_date, active, created_at, updated_at
       FROM pumps
       WHERE id = $1 AND active = true`,
      [pumpId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting pump:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updatePump = async (
  schemaName: string,
  pumpId: string,
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
    
    // Update pump
    const result = await client.query(
      `UPDATE pumps
       SET ${setClause}, updated_at = NOW()
       WHERE id = $1 AND active = true
       RETURNING id, station_id, name, serial_number, installation_date, active, created_at, updated_at`,
      [pumpId, ...values]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating pump:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deletePump = async (schemaName: string, pumpId: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Soft delete pump
    const result = await client.query(
      `UPDATE pumps
       SET active = false, deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND active = true
       RETURNING id`,
      [pumpId]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting pump:', error);
    throw error;
  } finally {
    client.release();
  }
};