import { insertWithUUID, executeQuery } from './db.service';

export const createPump = async (
  schemaName: string,
  stationId: string,
  name: string,
  serialNumber: string,
  installationDate: string
) => {
  return await insertWithUUID(
    schemaName,
    'pumps',
    {
      station_id: stationId,
      name,
      serial_number: serialNumber,
      installation_date: installationDate
    },
    'id, station_id, name, serial_number, installation_date, active, created_at'
  );
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
  const query = `
    UPDATE pumps
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1 AND active = true
    RETURNING id, station_id, name, serial_number, installation_date, active, created_at, updated_at`;

  const result = await executeQuery(schemaName, query, [pumpId, ...values]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const deletePump = async (schemaName: string, pumpId: string) => {
  const query = `
    UPDATE pumps
    SET active = false, deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND active = true
    RETURNING id`;
  const result = await executeQuery(schemaName, query, [pumpId]);
  return result.rows.length > 0;
};
