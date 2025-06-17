// backend/src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import { executeQuery } from '../services/db.service';

// Owner/Manager dashboard KPIs and trends
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const { stationId } = req.query;
    
    if (!stationId) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_STATION_ID',
        message: 'Station ID is required' 
      });
    }
    
    // Get user's role
    const userRole = req.user?.role;
    
    // Today's fuel prices
    const pricesQuery = `
      SELECT fph.fuel_type, fph.price_per_unit as price
      FROM fuel_price_history fph
      WHERE fph.station_id = $1
        AND fph.effective_from <= NOW()
        AND (fph.effective_to IS NULL OR fph.effective_to > NOW())
      ORDER BY fph.fuel_type
    `;
    
    const pricesResult = await executeQuery(schemaName, pricesQuery, [stationId]);
    
    // Today's sales summary
    const salesQuery = `
      SELECT 
        COALESCE(SUM(s.amount), 0) AS total_amount, 
        COALESCE(SUM(s.sale_volume), 0) AS total_volume,
        COUNT(*) AS transaction_count
      FROM sales s
      WHERE s.station_id = $1 
        AND DATE(s.recorded_at) = CURRENT_DATE
        AND s.status != 'voided'
    `;
    
    const salesResult = await executeQuery(schemaName, salesQuery, [stationId]);
    
    // 7-day sales trend
    const trendQuery = `
      SELECT 
        DATE(s.recorded_at) as sale_date, 
        COALESCE(SUM(s.amount), 0) AS total_amount
      FROM sales s
      WHERE s.station_id = $1 
        AND s.recorded_at >= CURRENT_DATE - INTERVAL '6 days'
        AND s.status != 'voided'
      GROUP BY DATE(s.recorded_at)
      ORDER BY DATE(s.recorded_at)
    `;
    
    const trendResult = await executeQuery(schemaName, trendQuery, [stationId]);
    
    // Payment breakdown
    const paymentsQuery = `
      SELECT 
        s.payment_method, 
        COALESCE(SUM(s.amount), 0) AS total
      FROM sales s
      WHERE s.station_id = $1 
        AND DATE(s.recorded_at) = CURRENT_DATE
        AND s.status != 'voided'
      GROUP BY s.payment_method
    `;
    
    const paymentsResult = await executeQuery(schemaName, paymentsQuery, [stationId]);
    
    // Top 3 creditors and aging
    const creditorsQuery = `
      SELECT 
        c.party_name as customer_name, 
        c.running_balance as outstanding,
        c.last_updated_at as last_update
      FROM creditors c
      WHERE c.running_balance > 0
      ORDER BY c.running_balance DESC
      LIMIT 3
    `;
    
    const creditorsResult = await executeQuery(schemaName, creditorsQuery);
    
    // Total credit outstanding
    const totalCreditQuery = `
      SELECT COALESCE(SUM(c.running_balance), 0) AS total_outstanding
      FROM creditors c
      WHERE c.running_balance > 0
    `;
    
    const totalCreditResult = await executeQuery(schemaName, totalCreditQuery);
    
    // Get station details
    const stationQuery = `
      SELECT name, address, city, state
      FROM stations
      WHERE id = $1
    `;
    
    const stationResult = await executeQuery(schemaName, stationQuery, [stationId]);
    
    // Get user's accessible stations
    const userStationsQuery = `
      SELECT s.id, s.name, us.role
      FROM stations s
      JOIN user_stations us ON s.id = us.station_id
      WHERE us.user_id = $1 AND us.active = true AND s.active = true
      ORDER BY s.name
    `;
    
    const userStationsResult = await executeQuery(schemaName, userStationsQuery, [req.user?.id]);
    
    return res.status(200).json({
      status: 'success',
      data: {
        userRole,
        station: stationResult.rows[0] || null,
        userStations: userStationsResult.rows || [],
        prices: pricesResult.rows || [],
        sales: salesResult.rows[0] || { total_amount: 0, total_volume: 0, transaction_count: 0 },
        trend: trendResult.rows || [],
        payments: paymentsResult.rows || [],
        creditors: creditorsResult.rows || [],
        totalCredit: totalCreditResult.rows[0]?.total_outstanding || 0
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to fetch dashboard data' 
    });
  }
};