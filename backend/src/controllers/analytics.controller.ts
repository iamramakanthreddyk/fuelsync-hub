// backend/src/controllers/analytics.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';
import { sendErrorResponse } from '../utils/errorResponse';

// Tenant sales analytics (for owner dashboard)
export const getTenantSalesAnalytics = async (req: Request, res: Response) => {
  const schemaName = req.schemaName as string;
  try {
    // Example: sales trend (last 30 days), total sales, avg sale, top products
    const trend = await pool.query(`
      SET search_path TO ${schemaName};
      SELECT date_trunc('day', created_at) AS day, SUM(amount) AS total
      FROM sales
      WHERE created_at > now() - interval '30 days'
      GROUP BY day ORDER BY day`);
    const total = await pool.query(`SELECT SUM(amount) AS total FROM sales`);
    const avg = await pool.query(`SELECT AVG(amount) AS avg FROM sales`);
    res.json({
      trend: trend.rows,
      total: total.rows[0].total,
      average: avg.rows[0].avg
    });
  } catch (err) {
    console.error('Sales analytics error:', err);
    sendErrorResponse(res, 'SERVER_ERROR', 'Failed to fetch sales analytics.', 500);
  }
};

// SuperAdmin global analytics (usage, limits, billing)
export const getGlobalAnalytics = async (_req: Request, res: Response) => {
  try {
    // Example: count tenants, users, stations, total sales
    const tenants = await pool.query('SELECT COUNT(*) FROM tenants');
    const users = await pool.query('SELECT COUNT(*) FROM public.users');
    const stations = await pool.query(`SELECT COUNT(*) FROM stations`);
    const sales = await pool.query('SELECT SUM(amount) FROM sales');
    res.json({
      tenants: tenants.rows[0].count,
      users: users.rows[0].count,
      stations: stations.rows[0].count,
      totalSales: sales.rows[0].sum
    });
  } catch (err) {
    console.error('Global analytics error:', err);
    sendErrorResponse(res, 'SERVER_ERROR', 'Failed to fetch global analytics.', 500);
  }
};
