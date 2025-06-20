import { insertWithUUID, executeQuery, withTransaction } from './db.service';

export const createNozzle = async (
  schemaName: string,
  pumpId: string,
  fuelType: string,
  initialReading: number
) => {
  return await insertWithUUID(
    schemaName,
    'nozzles',
    {
      pump_id: pumpId,
      fuel_type: fuelType,
      initial_reading: initialReading,
      current_reading: initialReading
    },
    'id, pump_id, fuel_type, initial_reading, current_reading, active, created_at'
  );
};

export const getNozzlesByPumpId = async (schemaName: string, pumpId: string) => {
  const query = `
    SELECT n.id, n.pump_id, n.fuel_type, n.initial_reading, n.current_reading, n.active, n.created_at, n.updated_at,
           p.name as pump_name
    FROM nozzles n
    JOIN pumps p ON n.pump_id = p.id
    WHERE n.pump_id = $1
    ORDER BY n.fuel_type`;
  const result = await executeQuery(schemaName, query, [pumpId]);
  return result.rows;
};

export const getNozzlesByStationId = async (schemaName: string, stationId: string) => {
  const query = `
    SELECT n.id, n.pump_id, n.fuel_type, n.initial_reading, n.current_reading, n.active, n.created_at, n.updated_at,
           p.name as pump_name
    FROM nozzles n
    JOIN pumps p ON n.pump_id = p.id
    WHERE p.station_id = $1 AND n.active = true
    ORDER BY p.name, n.fuel_type`;
  const result = await executeQuery(schemaName, query, [stationId]);
  return result.rows;
};

export const getNozzleById = async (schemaName: string, nozzleId: string) => {
  const query = `
    SELECT n.id, n.pump_id, n.fuel_type, n.initial_reading, n.current_reading, n.active, n.created_at, n.updated_at,
           p.name as pump_name
    FROM nozzles n
    JOIN pumps p ON n.pump_id = p.id
    WHERE n.id = $1`;
  const result = await executeQuery(schemaName, query, [nozzleId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const updateNozzle = async (
  schemaName: string,
  nozzleId: string,
  updates: Record<string, any>
) => {
  const setClause = Object.keys(updates)
    .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
    .join(', ');

  const values = Object.values(updates);
  const query = `
    UPDATE nozzles
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1
    RETURNING id, pump_id, fuel_type, initial_reading, current_reading, active, created_at, updated_at`;

  const result = await executeQuery(schemaName, query, [nozzleId, ...values]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const recordNozzleReading = async (
  schemaName: string,
  nozzleId: string,
  reading: number,
  recordedBy: string,
  notes?: string
) => {
  return await withTransaction(schemaName, async (client) => {
    const lastRes = await client.query(
      `SELECT current_reading FROM nozzles WHERE id = $1`,
      [nozzleId]
    );
    if (lastRes.rows.length === 0) {
      throw new Error('Nozzle not found');
    }

    const lastReading = parseFloat(lastRes.rows[0].current_reading);
    if (reading < lastReading) {
      throw new Error('New reading cannot be less than the last recorded reading');
    }

    await client.query(
      `UPDATE nozzles SET current_reading = $1, updated_at = NOW() WHERE id = $2`,
      [reading, nozzleId]
    );

    const result = await client.query(
      `INSERT INTO nozzle_readings (nozzle_id, reading, recorded_by, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nozzle_id, reading, recorded_at, recorded_by, notes`,
      [nozzleId, reading, recordedBy, notes]
    );

    return result.rows[0];
  });
};

export const deleteNozzle = async (schemaName: string, nozzleId: string) => {
  const query = `
    UPDATE nozzles
    SET active = false, deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND active = true
    RETURNING id`;
  const result = await executeQuery(schemaName, query, [nozzleId]);
  return result.rows.length > 0;
};
