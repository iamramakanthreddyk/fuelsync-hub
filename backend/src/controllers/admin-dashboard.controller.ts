// backend/src/controllers/admin-dashboard.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';

// Admin dashboard KPIs and trends
export const getAdminDashboardData = async (req: Request, res: Response) => {
  try {
    // Tenant summary
    const tenantSummaryQuery = `
      SELECT 
        COUNT(*) as total_tenants,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_tenants,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_tenants_30d
      FROM tenants
    `;
    
    const tenantSummary = await pool.query(tenantSummaryQuery);
    
    // Plan distribution
    const planDistributionQuery = `
      SELECT 
        subscription_plan, 
        COUNT(*) as count
      FROM tenants
      WHERE status = 'active'
      GROUP BY subscription_plan
      ORDER BY subscription_plan
    `;
    
    const planDistribution = await pool.query(planDistributionQuery);
    
    // Recent tenants
    const recentTenantsQuery = `
      SELECT 
        id, 
        name, 
        email, 
        subscription_plan, 
        status, 
        created_at
      FROM tenants
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const recentTenants = await pool.query(recentTenantsQuery);
    
    // System stats
    const systemStatsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM stations) as total_stations
    `;
    
    const systemStats = await pool.query(systemStatsQuery);
    
    return res.status(200).json({
      status: 'success',
      data: {
        tenantSummary: tenantSummary.rows[0] || { 
          total_tenants: 0, 
          active_tenants: 0, 
          suspended_tenants: 0, 
          new_tenants_30d: 0 
        },
        planDistribution: planDistribution.rows || [],
        recentTenants: recentTenants.rows || [],
        systemStats: systemStats.rows[0] || { total_users: 0, total_stations: 0 }
      }
    });
  } catch (error) {
    console.error('Admin dashboard data error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to fetch admin dashboard data' 
    });
  }
};