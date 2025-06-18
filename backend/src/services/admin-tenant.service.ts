// src/services/admin-tenant.service.ts
import pool from '../config/database';
import { generateUUID } from '../utils/uuid';
import bcrypt from 'bcrypt';

interface TenantInput {
  name: string;
  email: string;
  contactPerson: string;
  contactPhone: string;
  subscriptionPlan: string;
  status?: string;
}

/**
 * Get all tenants
 */
export async function getAllTenants() {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        email, 
        contact_person AS "contactPerson", 
        contact_phone AS "contactPhone", 
        subscription_plan AS "subscriptionPlan", 
        status, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
      FROM tenants
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    
    return result.rows;
  } catch (error) {
    console.error('Get all tenants error:', error);
    throw error;
  }
}

/**
 * Get tenant by ID
 */
export async function getTenantById(id: string) {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        email, 
        contact_person AS "contactPerson", 
        contact_phone AS "contactPhone", 
        subscription_plan AS "subscriptionPlan", 
        status, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
      FROM tenants
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Get tenant by ID error:', error);
    throw error;
  }
}

/**
 * Create tenant
 */
export async function createTenant(data: TenantInput) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if email already exists
    const checkEmailQuery = `
      SELECT id FROM tenants WHERE email = $1
    `;
    
    const emailResult = await client.query(checkEmailQuery, [data.email]);
    
    if (emailResult.rows.length > 0) {
      throw { code: 'DUPLICATE_EMAIL', message: 'Email already in use' };
    }
    
    // Create tenant
    const tenantId = generateUUID();
    const createTenantQuery = `
      INSERT INTO tenants (
        id,
        name,
        email,
        contact_person,
        contact_phone,
        subscription_plan,
        status,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING 
        id, 
        name, 
        email, 
        contact_person AS "contactPerson", 
        contact_phone AS "contactPhone", 
        subscription_plan AS "subscriptionPlan", 
        status, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
    `;
    
    const tenantResult = await client.query(createTenantQuery, [
      tenantId,
      data.name,
      data.email,
      data.contactPerson,
      data.contactPhone,
      data.subscriptionPlan,
      'active'
    ]);
    
    const tenant = tenantResult.rows[0];
    
    // Create default owner user
    const userId = generateUUID();
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    const createUserQuery = `
      INSERT INTO users (
        id,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        tenant_id,
        phone,
        active,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `;
    
    await client.query(createUserQuery, [
      userId,
      `owner@${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      passwordHash,
      'Default',
      'Owner',
      'owner',
      tenantId,
      data.contactPhone,
      true
    ]);
    
    await client.query('COMMIT');
    
    return tenant;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create tenant error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update tenant
 */
export async function updateTenant(id: string, data: Partial<TenantInput>) {
  try {
    // Check if email already exists for another tenant
    if (data.email) {
      const checkEmailQuery = `
        SELECT id FROM tenants WHERE email = $1 AND id != $2
      `;
      
      const emailResult = await pool.query(checkEmailQuery, [data.email, id]);
      
      if (emailResult.rows.length > 0) {
        throw { code: 'DUPLICATE_EMAIL', message: 'Email already in use' };
      }
    }
    
    // Build update query
    const updateFields = [];
    const queryParams = [id];
    let paramIndex = 2;
    
    if (data.name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      queryParams.push(data.name);
      paramIndex++;
    }
    
    if (data.email !== undefined) {
      updateFields.push(`email = $${paramIndex}`);
      queryParams.push(data.email);
      paramIndex++;
    }
    
    if (data.contactPerson !== undefined) {
      updateFields.push(`contact_person = $${paramIndex}`);
      queryParams.push(data.contactPerson);
      paramIndex++;
    }
    
    if (data.contactPhone !== undefined) {
      updateFields.push(`contact_phone = $${paramIndex}`);
      queryParams.push(data.contactPhone);
      paramIndex++;
    }
    
    if (data.subscriptionPlan !== undefined) {
      updateFields.push(`subscription_plan = $${paramIndex}`);
      queryParams.push(data.subscriptionPlan);
      paramIndex++;
    }
    
    if (data.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      queryParams.push(data.status);
      paramIndex++;
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    if (updateFields.length === 0) {
      // Nothing to update
      return await getTenantById(id);
    }
    
    const updateQuery = `
      UPDATE tenants
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING 
        id, 
        name, 
        email, 
        contact_person AS "contactPerson", 
        contact_phone AS "contactPhone", 
        subscription_plan AS "subscriptionPlan", 
        status, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
    `;
    
    const result = await pool.query(updateQuery, queryParams);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Update tenant error:', error);
    throw error;
  }
}

/**
 * Delete tenant
 */
export async function deleteTenant(id: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Delete tenant users
    await client.query('DELETE FROM users WHERE tenant_id = $1', [id]);
    
    // Delete tenant stations
    await client.query('DELETE FROM stations WHERE tenant_id = $1', [id]);
    
    // Delete tenant
    await client.query('DELETE FROM tenants WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete tenant error:', error);
    throw error;
  } finally {
    client.release();
  }
}