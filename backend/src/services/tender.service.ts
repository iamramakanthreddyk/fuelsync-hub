import { withTransaction, executeQuery } from './db.service';
import { v4 as uuidv4 } from 'uuid';

interface Shift {
  id: string;
  station_id: string;
  user_id: string;
  start_time: Date;
  end_time?: Date;
  status: 'open' | 'closed' | 'reconciled';
  opening_cash: number;
  closing_cash?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface TenderEntry {
  id: string;
  shift_id: string;
  station_id: string;
  user_id: string;
  tender_type: string;
  amount: number;
  recorded_at: Date;
  reference_number?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface ShiftSummary {
  shift: Shift;
  tender_totals: {
    cash: number;
    card: number;
    upi: number;
    credit: number;
    total: number;
  };
  sales_count: number;
  sales_volume: number;
  sales_amount: number;
}

export const openShift = async (
  schemaName: string,
  stationId: string,
  userId: string,
  openingCash: number,
  notes?: string
): Promise<Shift> => {
  return withTransaction(schemaName, async (client) => {
    const id = uuidv4();
    
    const result = await client.query(
      `INSERT INTO shifts (
        id, station_id, user_id, opening_cash, notes
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [id, stationId, userId, openingCash, notes || null]
    );
    
    return result.rows[0];
  });
};

export const closeShift = async (
  schemaName: string,
  shiftId: string,
  closingCash: number,
  notes?: string
): Promise<Shift> => {
  return withTransaction(schemaName, async (client) => {
    // Update the shift
    const result = await client.query(
      `UPDATE shifts
       SET status = 'closed', end_time = NOW(), closing_cash = $1, 
           notes = CASE WHEN $2 IS NULL THEN notes ELSE $2 END,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [closingCash, notes, shiftId]
    );
    
    return result.rows[0];
  });
};

export const getActiveShiftByUser = async (
  schemaName: string,
  userId: string
): Promise<Shift | null> => {
  const query = `
    SELECT s.*, st.name as station_name
    FROM shifts s
    JOIN stations st ON s.station_id = st.id
    WHERE s.user_id = $1 AND s.status = 'open'
    ORDER BY s.start_time DESC
    LIMIT 1
  `;
  
  const result = await executeQuery(schemaName, query, [userId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getShiftById = async (
  schemaName: string,
  shiftId: string
): Promise<Shift | null> => {
  const query = `
    SELECT s.*, st.name as station_name,
           u.first_name || ' ' || u.last_name as user_name
    FROM shifts s
    JOIN stations st ON s.station_id = st.id
    JOIN users u ON s.user_id = u.id
    WHERE s.id = $1
  `;
  
  const result = await executeQuery(schemaName, query, [shiftId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getShifts = async (
  schemaName: string,
  stationId?: string,
  status?: string,
  startDate?: string,
  endDate?: string
): Promise<Shift[]> => {
  let query = `
    SELECT s.*, st.name as station_name,
           u.first_name || ' ' || u.last_name as user_name
    FROM shifts s
    JOIN stations st ON s.station_id = st.id
    JOIN users u ON s.user_id = u.id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramIndex = 1;
  
  if (stationId) {
    query += ` AND s.station_id = $${paramIndex++}`;
    params.push(stationId);
  }
  
  if (status) {
    query += ` AND s.status = $${paramIndex++}`;
    params.push(status);
  }
  
  if (startDate) {
    query += ` AND s.start_time >= $${paramIndex++}`;
    params.push(startDate);
  }
  
  if (endDate) {
    query += ` AND s.start_time <= $${paramIndex++}`;
    params.push(endDate);
  }
  
  query += ` ORDER BY s.start_time DESC`;
  
  const result = await executeQuery(schemaName, query, params);
  return result.rows;
};

export const recordTenderEntry = async (
  schemaName: string,
  shiftId: string,
  stationId: string,
  userId: string,
  tenderType: string,
  amount: number,
  referenceNumber?: string,
  notes?: string
): Promise<TenderEntry> => {
  return withTransaction(schemaName, async (client) => {
    const id = uuidv4();
    
    const result = await client.query(
      `INSERT INTO tender_entries (
        id, shift_id, station_id, user_id, tender_type, amount,
        reference_number, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        id, shiftId, stationId, userId, tenderType, amount,
        referenceNumber || null, notes || null
      ]
    );
    
    return result.rows[0];
  });
};

export const getTenderEntriesByShift = async (
  schemaName: string,
  shiftId: string
): Promise<TenderEntry[]> => {
  const query = `
    SELECT te.*, u.first_name || ' ' || u.last_name as user_name
    FROM tender_entries te
    JOIN users u ON te.user_id = u.id
    WHERE te.shift_id = $1
    ORDER BY te.recorded_at DESC
  `;
  
  const result = await executeQuery(schemaName, query, [shiftId]);
  return result.rows;
};

export const getShiftSummary = async (
  schemaName: string,
  shiftId: string
): Promise<ShiftSummary> => {
  return withTransaction(schemaName, async (client) => {
    // Get shift details
    const shiftResult = await client.query(
      `SELECT s.*, st.name as station_name,
              u.first_name || ' ' || u.last_name as user_name
       FROM shifts s
       JOIN stations st ON s.station_id = st.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [shiftId]
    );
    
    if (shiftResult.rows.length === 0) {
      throw new Error('Shift not found');
    }
    
    const shift = shiftResult.rows[0];
    
    // Get tender totals
    const tenderTotalsResult = await client.query(
      `SELECT 
         tender_type,
         SUM(amount) as total
       FROM tender_entries
       WHERE shift_id = $1
       GROUP BY tender_type`,
      [shiftId]
    );
    
    // Initialize tender totals
    const tenderTotals = {
      cash: 0,
      card: 0,
      upi: 0,
      credit: 0,
      total: 0
    };
    
    // Populate tender totals
    tenderTotalsResult.rows.forEach((row) => {
      const type = row.tender_type;
      const amount = parseFloat(row.total);
      tenderTotals[type] = amount;
      tenderTotals.total += amount;
    });
    
    // Get sales data for the shift period
    const salesResult = await client.query(
      `SELECT 
         COUNT(*) as sales_count,
         COALESCE(SUM(sale_volume), 0) as sales_volume,
         COALESCE(SUM(amount), 0) as sales_amount
       FROM sales
       WHERE station_id = $1
         AND recorded_at >= $2
         AND (
           $3 IS NULL OR recorded_at <= $3
         )
         AND status != 'voided'`,
      [shift.station_id, shift.start_time, shift.end_time]
    );
    
    const salesData = salesResult.rows[0];
    
    return {
      shift,
      tender_totals: tenderTotals,
      sales_count: parseInt(salesData.sales_count),
      sales_volume: parseFloat(salesData.sales_volume),
      sales_amount: parseFloat(salesData.sales_amount)
    };
  });
};