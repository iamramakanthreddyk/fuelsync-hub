import { withTransaction, executeQuery } from './db.service';
import { v4 as uuidv4 } from 'uuid';

interface FuelPrice {
  id: string;
  station_id: string;
  fuel_type: string;
  price_per_unit: number;
  effective_from: Date;
  effective_to?: Date;
  created_by: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export const createFuelPrice = async (
  schemaName: string,
  stationId: string,
  fuelType: string,
  pricePerUnit: number,
  createdBy: string,
  effectiveFrom?: string,
  notes?: string
): Promise<FuelPrice> => {
  return withTransaction(schemaName, async (client) => {
    const id = uuidv4();
    
    // Use provided effective date or current timestamp
    const effectiveDate = effectiveFrom ? new Date(effectiveFrom) : new Date();
    
    const result = await client.query(
      `INSERT INTO fuel_price_history (
        id, station_id, fuel_type, price_per_unit, effective_from,
        created_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        id, stationId, fuelType, pricePerUnit, effectiveDate,
        createdBy, notes || null
      ]
    );
    
    return result.rows[0];
  });
};

export const getCurrentFuelPrices = async (
  schemaName: string,
  stationId: string
): Promise<FuelPrice[]> => {
  const query = `
    SELECT fph.*, s.name as station_name,
           u.first_name || ' ' || u.last_name as created_by_name
    FROM fuel_price_history fph
    JOIN stations s ON fph.station_id = s.id
    JOIN users u ON fph.created_by = u.id
    WHERE fph.station_id = $1
      AND fph.effective_to IS NULL
    ORDER BY fph.fuel_type
  `;
  
  const result = await executeQuery(schemaName, query, [stationId]);
  return result.rows;
};

export const getFuelPriceHistory = async (
  schemaName: string,
  stationId: string,
  fuelType?: string,
  startDate?: string,
  endDate?: string
): Promise<FuelPrice[]> => {
  let query = `
    SELECT fph.*, s.name as station_name,
           u.first_name || ' ' || u.last_name as created_by_name
    FROM fuel_price_history fph
    JOIN stations s ON fph.station_id = s.id
    JOIN users u ON fph.created_by = u.id
    WHERE fph.station_id = $1
  `;
  
  const params: any[] = [stationId];
  let paramIndex = 2;
  
  if (fuelType) {
    query += ` AND fph.fuel_type = $${paramIndex++}`;
    params.push(fuelType);
  }
  
  if (startDate) {
    query += ` AND fph.effective_from >= $${paramIndex++}`;
    params.push(startDate);
  }
  
  if (endDate) {
    query += ` AND (fph.effective_to IS NULL OR fph.effective_to <= $${paramIndex++})`;
    params.push(endDate);
  }
  
  query += ` ORDER BY fph.fuel_type, fph.effective_from DESC`;
  
  const result = await executeQuery(schemaName, query, params);
  return result.rows;
};

export const getFuelPriceById = async (
  schemaName: string,
  fuelPriceId: string
): Promise<FuelPrice | null> => {
  const query = `
    SELECT fph.*, s.name as station_name,
           u.first_name || ' ' || u.last_name as created_by_name
    FROM fuel_price_history fph
    JOIN stations s ON fph.station_id = s.id
    JOIN users u ON fph.created_by = u.id
    WHERE fph.id = $1
  `;
  
  const result = await executeQuery(schemaName, query, [fuelPriceId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getFuelPriceAtDate = async (
  schemaName: string,
  stationId: string,
  fuelType: string,
  date: string
): Promise<FuelPrice | null> => {
  const query = `
    SELECT fph.*, s.name as station_name,
           u.first_name || ' ' || u.last_name as created_by_name
    FROM fuel_price_history fph
    JOIN stations s ON fph.station_id = s.id
    JOIN users u ON fph.created_by = u.id
    WHERE fph.station_id = $1
      AND fph.fuel_type = $2
      AND fph.effective_from <= $3
      AND (fph.effective_to IS NULL OR fph.effective_to > $3)
    ORDER BY fph.effective_from DESC
    LIMIT 1
  `;
  
  const result = await executeQuery(schemaName, query, [stationId, fuelType, date]);
  return result.rows.length > 0 ? result.rows[0] : null;
};