// src/services/admin-settings.service.ts
import pool from '../config/database';
import { generateUUID } from '../utils/uuid';

interface TenantLimits {
  stations: number;
  users: number;
}

interface SystemSettings {
  tenantLimits: {
    basic: TenantLimits;
    premium: TenantLimits;
    enterprise: TenantLimits;
  };
  systemMaintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
  };
}

/**
 * Get admin settings
 */
export async function getSettings(): Promise<SystemSettings> {
  try {
    // Get tenant limits
    const tenantLimitsQuery = `
      SELECT value FROM admin_settings WHERE key = 'tenant_limits'
    `;
    
    const tenantLimitsResult = await pool.query(tenantLimitsQuery);
    
    // Get system maintenance settings
    const maintenanceQuery = `
      SELECT value FROM admin_settings WHERE key = 'system_maintenance'
    `;
    
    const maintenanceResult = await pool.query(maintenanceQuery);
    
    // Default settings if not found
    const defaultSettings: SystemSettings = {
      tenantLimits: {
        basic: { stations: 3, users: 10 },
        premium: { stations: 10, users: 50 },
        enterprise: { stations: -1, users: -1 }
      },
      systemMaintenance: {
        enabled: false,
        message: 'System is under maintenance',
        allowedIPs: []
      }
    };
    
    // Merge with database settings if available
    if (tenantLimitsResult.rows.length > 0) {
      defaultSettings.tenantLimits = tenantLimitsResult.rows[0].value;
    }
    
    if (maintenanceResult.rows.length > 0) {
      defaultSettings.systemMaintenance = maintenanceResult.rows[0].value;
    }
    
    return defaultSettings;
  } catch (error) {
    console.error('Get settings error:', error);
    throw error;
  }
}

/**
 * Update admin settings
 */
export async function updateSettings(settings: SystemSettings): Promise<SystemSettings> {
  try {
    // Update tenant limits
    const tenantLimitsQuery = `
      INSERT INTO admin_settings (id, key, value, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (key) DO UPDATE
      SET value = $3, updated_at = CURRENT_TIMESTAMP
    `;
    
    await pool.query(tenantLimitsQuery, [
      generateUUID(),
      'tenant_limits',
      JSON.stringify(settings.tenantLimits),
      'Default limits for different tenant subscription plans'
    ]);
    
    // Update system maintenance settings
    const maintenanceQuery = `
      INSERT INTO admin_settings (id, key, value, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (key) DO UPDATE
      SET value = $3, updated_at = CURRENT_TIMESTAMP
    `;
    
    await pool.query(maintenanceQuery, [
      generateUUID(),
      'system_maintenance',
      JSON.stringify(settings.systemMaintenance),
      'System maintenance mode settings'
    ]);
    
    return settings;
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
}