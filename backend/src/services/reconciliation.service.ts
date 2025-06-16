import pool from '../config/database';

export const createReconciliation = async (
  schemaName: string,
  stationId: string,
  date: string,
  totalSales: number,
  cashTotal: number,
  creditTotal: number,
  cardTotal: number,
  upiTotal: number,
  finalized: boolean,
  createdBy: string,
  notes?: string
) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Check if reconciliation already exists for this date and station
    const existingResult = await client.query(
      `SELECT id FROM day_reconciliations WHERE station_id = $1 AND date = $2`,
      [stationId, date]
    );
    
    let reconciliationId;
    
    if (existingResult.rows.length > 0) {
      // Update existing reconciliation
      reconciliationId = existingResult.rows[0].id;
      
      await client.query(
        `UPDATE day_reconciliations
         SET total_sales = $1, cash_total = $2, credit_total = $3, card_total = $4, upi_total = $5,
             finalized = $6, notes = $7, updated_at = NOW()
         WHERE id = $8`,
        [totalSales, cashTotal, creditTotal, cardTotal, upiTotal, finalized, notes, reconciliationId]
      );
    } else {
      // Create new reconciliation
      const result = await client.query(
        `INSERT INTO day_reconciliations (
           station_id, date, total_sales, cash_total, credit_total, card_total, upi_total, 
           finalized, created_by, notes
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [stationId, date, totalSales, cashTotal, creditTotal, cardTotal, upiTotal, 
         finalized, createdBy, notes]
      );
      
      reconciliationId = result.rows[0].id;
    }
    
    // If finalized, mark all sales for this date as reconciled
    if (finalized) {
      await client.query(
        `UPDATE sales
         SET status = 'posted'
         WHERE station_id = $1 
         AND DATE(recorded_at) = $2
         AND status = 'draft'`,
        [stationId, date]
      );
    }
    
    await client.query('COMMIT');
    
    // Get the complete reconciliation data
    const reconciliationResult = await client.query(
      `SELECT dr.*, s.name as station_name, 
         u.first_name || ' ' || u.last_name as created_by_name
       FROM day_reconciliations dr
       JOIN stations s ON dr.station_id = s.id
       JOIN users u ON dr.created_by = u.id
       WHERE dr.id = $1`,
      [reconciliationId]
    );
    
    return reconciliationResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating reconciliation:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getReconciliations = async (
  schemaName: string,
  stationId?: string,
  startDate?: string,
  endDate?: string
) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    let query = `
      SELECT dr.*, s.name as station_name, 
        u.first_name || ' ' || u.last_name as created_by_name
      FROM day_reconciliations dr
      JOIN stations s ON dr.station_id = s.id
      JOIN users u ON dr.created_by = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (stationId) {
      query += ` AND dr.station_id = $${paramIndex++}`;
      params.push(stationId);
    }
    
    if (startDate) {
      query += ` AND dr.date >= $${paramIndex++}`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND dr.date <= $${paramIndex++}`;
      params.push(endDate);
    }
    
    query += ` ORDER BY dr.date DESC, s.name`;
    
    const result = await client.query(query, params);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting reconciliations:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getReconciliationById = async (schemaName: string, reconciliationId: string) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    const result = await client.query(
      `SELECT dr.*, s.name as station_name, 
         u.first_name || ' ' || u.last_name as created_by_name
       FROM day_reconciliations dr
       JOIN stations s ON dr.station_id = s.id
       JOIN users u ON dr.created_by = u.id
       WHERE dr.id = $1`,
      [reconciliationId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting reconciliation:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getDailySalesTotals = async (
  schemaName: string,
  stationId: string,
  date: string
) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    const result = await client.query(
      `SELECT 
         COALESCE(SUM(amount), 0) as total_sales,
         COALESCE(SUM(cash_received), 0) as cash_total,
         COALESCE(SUM(credit_given), 0) as credit_total
       FROM sales
       WHERE station_id = $1 
         AND DATE(recorded_at) = $2
         AND status != 'voided'`,
      [stationId, date]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting daily sales totals:', error);
    throw error;
  } finally {
    client.release();
  }
};