import { PoolClient } from 'pg';

export async function validateTenantHasStation(client: PoolClient, tenantId: string) {
  const res = await client.query(
    'SELECT COUNT(*) FROM stations WHERE tenant_id = $1 AND active = true',
    [tenantId]
  );
  if (parseInt(res.rows[0].count, 10) < 1) {
    throw new Error('Tenant must have at least one active station');
  }
}

export async function validateStationHasPump(client: PoolClient, stationId: string) {
  const res = await client.query(
    'SELECT COUNT(*) FROM pumps WHERE station_id = $1 AND active = true',
    [stationId]
  );
  if (parseInt(res.rows[0].count, 10) < 1) {
    throw new Error('Station must have at least one active pump');
  }
}

export async function validatePumpHasNozzles(client: PoolClient, pumpId: string) {
  const res = await client.query(
    'SELECT COUNT(*) FROM nozzles WHERE pump_id = $1 AND active = true',
    [pumpId]
  );
  if (parseInt(res.rows[0].count, 10) < 2) {
    throw new Error('Pump must have at least two active nozzles');
  }
}
