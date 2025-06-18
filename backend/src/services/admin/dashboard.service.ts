// src/services/admin/dashboard.service.ts
import pool from '../../config/database';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    // Get tenant count
    const tenantCountQuery = `
      SELECT COUNT(*) as count FROM tenants WHERE active = true
    `;
    
    // Get user count
    const userCountQuery = `
      SELECT COUNT(*) as count FROM users WHERE active = true
    `;
    
    // Get station count
    const stationCountQuery = `
      SELECT COUNT(*) as count FROM stations WHERE active = true
    `;
    
    // Get recent tenants
    const recentTenantsQuery = `
      SELECT 
        id, 
        name, 
        email, 
        subscription_plan, 
        status, 
        created_at
      FROM tenants
      WHERE active = true
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    // Get recent activity
    const recentActivityQuery = `
      SELECT 
        a.id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.created_at,
        au.email as admin_email,
        au.first_name as admin_first_name,
        au.last_name as admin_last_name
      FROM admin_activity_logs a
      JOIN admin_users au ON a.admin_id = au.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `;
    
    // Execute all queries in parallel
    const [
      tenantCountResult,
      userCountResult,
      stationCountResult,
      recentTenantsResult,
      recentActivityResult
    ] = await Promise.all([
      pool.query(tenantCountQuery),
      pool.query(userCountQuery),
      pool.query(stationCountQuery),
      pool.query(recentTenantsQuery),
      pool.query(recentActivityQuery)
    ]);
    
    return {
      tenantCount: parseInt(tenantCountResult.rows[0].count),
      userCount: parseInt(userCountResult.rows[0].count),
      stationCount: parseInt(stationCountResult.rows[0].count),
      recentTenants: recentTenantsResult.rows,
      recentActivity: recentActivityResult.rows
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
}