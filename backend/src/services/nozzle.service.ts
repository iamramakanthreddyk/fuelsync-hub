import pool from '../config/database';

export const createNozzle = async (
  schemaName: string,
  pumpId: string,
  fuelType: string,
  initialReading: number
) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Create nozzle
    const result = await client.query(
      `INSERT INTO nozzles (pump_id, fuel_type, initial_reading, current_reading)
       VALUES ($1, $2, $3, $3)
       RETURNING id, pump_id, fuel_type, initial_reading, current_reading, active, created_at`,
      [pumpId, fuelType, initialReading]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating nozzle:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getNozzlesByPumpId = async (schemaName: string, pumpId: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Get all nozzles for the pump
    const result = await client.query(
      `SELECT n.id, n.pump_id, n.fuel_type, n.initial_reading, n.current_reading, n.active, n.created_at, n.updated_at,
         p.name as pump_name
       FROM nozzles n
       JOIN pumps p ON n.pump_id = p.id
       WHERE n.pump_id = $1
       ORDER BY n.fuel_type`,
      [pumpId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting nozzles:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getNozzlesByStationId = async (schemaName: string, stationId: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Get all nozzles for the station
    const result = await client.query(
      `SELECT n.id, n.pump_id, n.fuel_type, n.initial_reading, n.current_reading, n.active, n.created_at, n.updated_at,
         p.name as pump_name
       FROM nozzles n
       JOIN pumps p ON n.pump_id = p.id
       WHERE p.station_id = $1 AND n.active = true
       ORDER BY p.name, n.fuel_type`,
      [stationId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting nozzles by station:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getNozzleById = async (schemaName: string, nozzleId: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Get nozzle by ID
    const result = await client.query(
      `SELECT n.id, n.pump_id, n.fuel_type, n.initial_reading, n.current_reading, n.active, n.created_at, n.updated_at,
         p.name as pump_name
       FROM nozzles n
       JOIN pumps p ON n.pump_id = p.id
       WHERE n.id = $1`,
      [nozzleId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting nozzle:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateNozzle = async (
  schemaName: string,
  nozzleId: string,
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
    
    // Update nozzle
    const result = await client.query(
      `UPDATE nozzles
       SET ${setClause}, updated_at = NOW()
       WHERE id = $1
       RETURNING id, pump_id, fuel_type, initial_reading, current_reading, active, created_at, updated_at`,
      [nozzleId, ...values]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating nozzle:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const recordNozzleReading = async (
  schemaName: string,
  nozzleId: string,
  reading: number,
  recordedBy: string,
  notes?: string
) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Update nozzle current reading
    await client.query(
      `UPDATE nozzles SET current_reading = $1, updated_at = NOW() WHERE id = $2`,
      [reading, nozzleId]
    );
    
    // Record reading history
    const result = await client.query(
      `INSERT INTO nozzle_readings (nozzle_id, reading, recorded_by, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nozzle_id, reading, recorded_at, recorded_by, notes`,
      [nozzleId, reading, recordedBy, notes]
    );
    
    await client.query('COMMIT');
    
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recording nozzle reading:', error);
    throw error;
  } finally {
    client.release();
  }
};