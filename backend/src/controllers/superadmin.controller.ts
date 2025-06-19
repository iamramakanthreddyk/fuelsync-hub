// backend/src/controllers/superadmin.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// Get all tenants
export const getTenants = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT id, name, email, subscription_plan, status, contact_person, 
             active, created_at, updated_at
      FROM tenants
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    return res.status(200).json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get tenants'
    });
  }
};

// Create a new tenant
export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name, email, subscription_plan, contact_person } = req.body;
    
    if (!name || !email || !contact_person) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and contact person are required'
      });
    }
    
    const id = uuidv4();
    const plan = subscription_plan || 'basic';
    
    const query = `
      INSERT INTO tenants (
        id, name, email, subscription_plan, contact_person, status, active
      ) VALUES (
        $1, $2, $3, $4, $5, 'active', true
      )
      RETURNING id, name, email, subscription_plan, contact_person, status, active, created_at
    `;
    
    const result = await pool.query(query, [id, name, email, plan, contact_person]);
    
    // Create tenant schema
    const schemaName = `tenant_${id.replace(/-/g, '_')}`;
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    
    return res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create tenant'
    });
  }
};

// Get tenant by ID
export const getTenantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT id, name, email, subscription_plan, status, contact_person, 
             contact_phone, address, city, state, zip, max_stations, max_users,
             active, created_at, updated_at
      FROM tenants
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get tenant'
    });
  }
};

// Update tenant
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, subscription_plan, contact_person, status } = req.body;
    
    // Build SET clause dynamically based on provided fields
    const updates: any = {};
    const values: any[] = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.name = `$${paramCount++}`;
      values.push(name);
    }
    
    if (email !== undefined) {
      updates.email = `$${paramCount++}`;
      values.push(email);
    }
    
    if (subscription_plan !== undefined) {
      updates.subscription_plan = `$${paramCount++}`;
      values.push(subscription_plan);
    }
    
    if (contact_person !== undefined) {
      updates.contact_person = `$${paramCount++}`;
      values.push(contact_person);
    }
    
    if (status !== undefined) {
      updates.status = `$${paramCount++}`;
      values.push(status);
    }
    
    // Add updated_at
    updates.updated_at = `$${paramCount++}`;
    values.push(new Date());
    
    // If no updates, return error
    if (Object.keys(updates).length === 1) { // Only updated_at
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }
    
    // Build SET clause
    const setClause = Object.entries(updates)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');
    
    // Add tenant ID to values
    values.push(id);
    
    const query = `
      UPDATE tenants
      SET ${setClause}
      WHERE id = $${paramCount}
      RETURNING id, name, email, subscription_plan, contact_person, status, active, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update tenant'
    });
  }
};

// Delete tenant
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting active = false
    const query = `
      UPDATE tenants
      SET active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Delete tenant error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete tenant'
    });
  }
};

// Get tenant users
export const getTenantUsers = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    const query = `
      SELECT id, email, role, first_name, last_name, phone, active, created_at, updated_at
      FROM users
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [tenantId]);
    
    return res.status(200).json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Get tenant users error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get tenant users'
    });
  }
};

// Get tenant user by ID
export const getTenantUser = async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.params;
    
    const query = `
      SELECT id, email, role, first_name, last_name, phone, active, created_at, updated_at
      FROM users
      WHERE tenant_id = $1 AND id = $2
    `;
    
    const result = await pool.query(query, [tenantId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get tenant user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get tenant user'
    });
  }
};

// Delete tenant user
export const deleteTenantUser = async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.params;
    
    // Soft delete by setting active = false
    const query = `
      UPDATE users
      SET active = false, updated_at = NOW()
      WHERE tenant_id = $1 AND id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [tenantId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete tenant user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete tenant user'
    });
  }
};

// Reset user password
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE tenant_id = $2 AND id = $3
      RETURNING id
    `;
    
    const result = await pool.query(query, [passwordHash, tenantId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to reset password'
    });
  }
};

// Get platform stats
export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    // Get tenant count
    const tenantQuery = `SELECT COUNT(*) as count FROM tenants WHERE active = true`;
    const tenantResult = await pool.query(tenantQuery);
    const tenantCount = parseInt(tenantResult.rows[0].count);
    
    // Get user count
    const userQuery = `SELECT COUNT(*) as count FROM users WHERE active = true`;
    const userResult = await pool.query(userQuery);
    const userCount = parseInt(userResult.rows[0].count);
    
    // Get station count
    const stationQuery = `SELECT COUNT(*) as count FROM stations WHERE active = true`;
    const stationResult = await pool.query(stationQuery);
    const stationCount = parseInt(stationResult.rows[0].count);
    
    // Get recent tenants
    const recentTenantsQuery = `
      SELECT id, name, email, subscription_plan, created_at
      FROM tenants
      WHERE active = true
      ORDER BY created_at DESC
      LIMIT 5
    `;
    const recentTenantsResult = await pool.query(recentTenantsQuery);
    
    return res.status(200).json({
      status: 'success',
      data: {
        tenantCount,
        userCount,
        stationCount,
        recentTenants: recentTenantsResult.rows
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get platform stats'
    });
  }
};

// Seed tenant with test data
export const seedTenant = async (req: Request, res: Response) => {
  // Placeholder for seeding functionality
  return res.status(200).json({
    status: 'success',
    message: 'Seeding not implemented yet'
  });
};

// Reset dev tenant
export const resetDevTenant = async (req: Request, res: Response) => {
  // Placeholder for reset functionality
  return res.status(200).json({
    status: 'success',
    message: 'Reset not implemented yet'
  });
};