import { withTransaction, executeQuery } from './db.service';
import { v4 as uuidv4 } from 'uuid';
import {
  validateStationHasPump,
  validatePumpHasNozzles
} from './hierarchyValidation.service';

export interface NozzleInput {
  fuelType: string;
  initialReading: number;
}

export const createPump = async (
  schemaName: string,
  stationId: string,
  name: string,
  serialNumber: string,
  installationDate: string,
  nozzles: NozzleInput[]
) => {
  if (!nozzles || nozzles.length < 2) {
    throw new Error('Pump must have at least two active nozzles');
  }

  return withTransaction(schemaName, async (client) => {
    const pumpId = uuidv4();
    const pumpRes = await client.query(
      `INSERT INTO pumps (
        id, station_id, name, serial_number, installation_date
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, station_id, name, serial_number, installation_date, active, created_at`,
      [pumpId, stationId, name, serialNumber, installationDate]
    );

    for (const n of nozzles) {
      await client.query(
        `INSERT INTO nozzles (
          id, pump_id, fuel_type, initial_reading, current_reading
        ) VALUES ($1, $2, $3, $4, $4)`,
        [uuidv4(), pumpId, n.fuelType, n.initialReading]
      );
    }

    await validateStationHasPump(client, stationId);
    await validatePumpHasNozzles(client, pumpId);

    return pumpRes.rows[0];
  });
};

export const getPumpsByStationId = async (schemaName: string, stationId: string) => {
  const query = `
    SELECT id, station_id, name, serial_number, installation_date, active, created_at, updated_at
    FROM pumps
    WHERE station_id = $1 AND active = true
    ORDER BY name`;
  const result = await executeQuery(schemaName, query, [stationId]);
  return result.rows;
};

export const getPumpById = async (schemaName: string, pumpId: string) => {
  const query = `
    SELECT id, station_id, name, serial_number, installation_date, active, created_at, updated_at
    FROM pumps
    WHERE id = $1 AND active = true`;
  const result = await executeQuery(schemaName, query, [pumpId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const updatePump = async (
  schemaName: string,
  pumpId: string,
  updates: Record<string, any>
) => {
  const setClause = Object.keys(updates)
    .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
    .join(', ');

  const values = Object.values(updates);

  return withTransaction(schemaName, async (client) => {
    const query = `
      UPDATE pumps
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND active = true
      RETURNING id, station_id, name, serial_number, installation_date, active, created_at, updated_at`;

    const result = await client.query(query, [pumpId, ...values]);
    if (result.rows.length === 0) {
      return null;
    }

    const pump = result.rows[0];
    await validateStationHasPump(client, pump.station_id);
    await validatePumpHasNozzles(client, pump.id);
    return pump;
  });
};

export const deletePump = async (schemaName: string, pumpId: string) => {
  return withTransaction(schemaName, async (client) => {
    const query = `
      UPDATE pumps
      SET active = false, deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND active = true
      RETURNING id, station_id`;
    const result = await client.query(query, [pumpId]);
    if (result.rows.length === 0) {
      return false;
    }

    const { station_id } = result.rows[0];
    await validateStationHasPump(client, station_id);
    return true;
  });
};
