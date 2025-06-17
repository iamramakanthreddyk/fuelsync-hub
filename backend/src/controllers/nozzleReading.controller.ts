// backend/src/controllers/nozzleReading.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';

// Get previous day's readings for all nozzles at a station
export const getPreviousNozzleReadings = async (req: Request, res: Response) => {
  const { stationId } = req.params;
  const schemaName = req.schemaName as string;
  try {
    const result = await pool.query(
      `SET search_path TO ${schemaName};
       SELECT n.id AS nozzle_id, n.name, n.fuel_type, r.reading AS previous_reading
       FROM nozzles n
       LEFT JOIN LATERAL (
         SELECT reading FROM nozzle_readings
         WHERE nozzle_id = n.id AND reading_date = (CURRENT_DATE - INTERVAL '1 day')
         ORDER BY reading_date DESC LIMIT 1
       ) r ON TRUE
       WHERE n.station_id = $1 AND n.active = true`,
      [stationId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch previous readings.' });
  }
};

// Get current fuel prices for all nozzles at a station
export const getCurrentFuelPrices = async (req: Request, res: Response) => {
  const { stationId } = req.params;
  const schemaName = req.schemaName as string;
  try {
    const result = await pool.query(
      `SET search_path TO ${schemaName};
       SELECT n.id AS nozzle_id, n.fuel_type, p.price
       FROM nozzles n
       JOIN fuel_prices p ON p.fuel_type = n.fuel_type
       WHERE n.station_id = $1 AND n.active = true AND p.active = true
       ORDER BY n.fuel_type`,
      [stationId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fuel prices.' });
  }
};

// Submit today's readings for all nozzles at a station
export const submitNozzleReadings = async (req: Request, res: Response) => {
  const { stationId } = req.params;
  const schemaName = req.schemaName as string;
  const { readings } = req.body; // [{ nozzleId, reading }]
  if (!Array.isArray(readings) || readings.length === 0) {
    return res.status(400).json({ message: 'No readings provided.' });
  }
  try {
    // Validate and insert readings, create sales records
    for (const { nozzleId, reading } of readings) {
      // Fetch previous reading
      const prevRes = await pool.query(
        `SET search_path TO ${schemaName};
         SELECT reading FROM nozzle_readings WHERE nozzle_id = $1 AND reading_date = (CURRENT_DATE - INTERVAL '1 day') LIMIT 1`,
        [nozzleId]
      );
      const prev = prevRes.rows[0]?.reading || 0;
      if (reading < prev) {
        return res.status(400).json({ message: `Reading for nozzle ${nozzleId} is less than previous.` });
      }
      // Insert new reading
      await pool.query(
        `INSERT INTO nozzle_readings (nozzle_id, reading, reading_date) VALUES ($1, $2, CURRENT_DATE)`,
        [nozzleId, reading]
      );
      // Calculate volume sold and create sales record
      const volume = reading - prev;
      if (volume > 0) {
        // Get price
        const priceRes = await pool.query(
          `SELECT price FROM fuel_prices WHERE fuel_type = (SELECT fuel_type FROM nozzles WHERE id = $1) AND active = true LIMIT 1`,
          [nozzleId]
        );
        const price = priceRes.rows[0]?.price || 0;
        await pool.query(
          `INSERT INTO sales (station_id, nozzle_id, volume, amount, sale_date)
           VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
          [stationId, nozzleId, volume, volume * price]
        );
      }
    }
    res.json({ message: 'Readings submitted and sales recorded.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit readings.' });
  }
};
