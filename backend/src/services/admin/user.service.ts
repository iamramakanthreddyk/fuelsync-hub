// src/services/admin/user.service.ts
import bcrypt from 'bcrypt';
import pool from '../../config/database';
import { generateUUID } from '../../utils/uuid';

interface UserCreateParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  phone?: string;
}

interface UserUpdateParams {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string;
  active?: boolean;
}

/**
 * Get users with pagination, search, and tenant filtering
 */
export async function getUsers(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  tenantId: string = ''
) {
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT 
      u.id, 
      u.email, 
      u.first_name, 
      u.last_name, 
      u.role, 
      u.tenant_id,
      u.phone,
      u.active,
      u.created_at,
      u.updated_at,
      t.name as tenant_name
    FROM users u
    LEFT JOIN tenants t ON u.tenant_id = t.id
    WHERE 1=1
  `;
  
  const queryParams: any[] = [];
  let paramIndex = 1;
  
  // Add search condition if provided
  if (search) {
    query += ` AND (
      u.email ILIKE $${paramIndex} OR
      u.first_name ILIKE $${paramIndex} OR
      u.last_name ILIKE $${paramIndex}
    )`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }
  
  // Add tenant filter if provided
  if (tenantId) {
    query += ` AND u.tenant_id = $${paramIndex}`;
    queryParams.push(tenantId);
    paramIndex++;
  }
  
  // Add pagination
  query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);
  
  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(*) as total
    FROM users u
    WHERE 1=1
  `;
  
  let countParams: any[] = [];
  let countParamIndex = 1;
  
  // Add search condition if provided
  if (search) {
    countQuery += ` AND (
      u.email ILIKE $${countParamIndex} OR
      u.first_name ILIKE $${countParamIndex} OR
      u.last_name ILIKE $${countParamIndex}
    )`;
    countParams.push(`%${search}%`);
    countParamIndex++;
  }
  
  // Add tenant filter if provided
  if (tenantId) {
    countQuery += ` AND u.tenant_id = $${countParamIndex}`;
    countParams.push(tenantId);
  }
  
  try {
    const [usersResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams)
    ]);
    
    const users = usersResult.rows;
    const total = parseInt(countResult.rows[0].total);
    
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  try {
    const query = `
      SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.tenant_id,
        u.phone,
        u.active,
        u.created_at,
        u.updated_at,
        t.name as tenant_name
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    
    // Get user's stations
    const stationsQuery = `
      SELECT 
        s.id,
        s.name,
        us.role as user_role
      FROM user_stations us
      JOIN stations s ON us.station_id = s.id
      WHERE us.user_id = $1 AND us.active = true
    `;
    
    const stationsResult = await pool.query(stationsQuery, [id]);
    
    return {
      ...user,
      stations: stationsResult.rows
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(params: UserCreateParams) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Hash password
    const passwordHash = await bcrypt.hash(params.password, 10);
    
    // Generate UUID
    const userId = generateUUID();
    
    // Insert user into public schema
    const publicQuery = `
      INSERT INTO users (
        id, 
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        tenant_id,
        phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        tenant_id,
        phone,
        active,
        created_at,
        updated_at
    `;
    
    const publicResult = await client.query(publicQuery, [
      userId,
      params.email,
      passwordHash,
      params.firstName,
      params.lastName,
      params.role,
      params.tenantId,
      params.phone || null
    ]);
    
    // Get tenant schema name
    const schemaQuery = `
      SELECT schema_name FROM tenants WHERE id = $1
    `;
    
    const schemaResult = await client.query(schemaQuery, [params.tenantId]);
    
    if (schemaResult.rows.length === 0) {
      throw new Error('Tenant not found');
    }
    
    const schemaName = schemaResult.rows[0].schema_name;
    
    // Insert user into tenant schema
    const tenantQuery = `
      INSERT INTO "${schemaName}".users (
        id, 
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        tenant_id,
        phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    await client.query(tenantQuery, [
      userId,
      params.email,
      passwordHash,
      params.firstName,
      params.lastName,
      params.role,
      params.tenantId,
      params.phone || null
    ]);
    
    await client.query('COMMIT');
    
    return publicResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating user:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update a user
 */
export async function updateUser(id: string, params: UserUpdateParams) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get current user data
    const userQuery = `
      SELECT * FROM users WHERE id = $1
    `;
    
    const userResult = await client.query(userQuery, [id]);
    
    if (userResult.rows.length === 0) {
      return null;
    }
    
    const user = userResult.rows[0];
    
    // Build update query
    const updates: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;
    
    if (params.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(params.email);
    }
    
    if (params.password !== undefined) {
      const passwordHash = await bcrypt.hash(params.password, 10);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
    }
    
    if (params.firstName !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(params.firstName);
    }
    
    if (params.lastName !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(params.lastName);
    }
    
    if (params.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(params.role);
    }
    
    if (params.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(params.phone);
    }
    
    if (params.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(params.active);
    }
    
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 0) {
      return user;
    }
    
    // Update user in public schema
    const publicQuery = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING 
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        tenant_id,
        phone,
        active,
        created_at,
        updated_at
    `;
    
    const publicResult = await client.query(publicQuery, values);
    
    // Get tenant schema name
    const schemaQuery = `
      SELECT schema_name FROM tenants WHERE id = $1
    `;
    
    const schemaResult = await client.query(schemaQuery, [user.tenant_id]);
    
    if (schemaResult.rows.length === 0) {
      throw new Error('Tenant not found');
    }
    
    const schemaName = schemaResult.rows[0].schema_name;
    
    // Update user in tenant schema
    const tenantQuery = `
      UPDATE "${schemaName}".users
      SET ${updates.join(', ')}
      WHERE id = $1
    `;
    
    await client.query(tenantQuery, values);
    
    await client.query('COMMIT');
    
    return publicResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating user:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get user data
    const userQuery = `
      SELECT * FROM users WHERE id = $1
    `;
    
    const userResult = await client.query(userQuery, [id]);
    
    if (userResult.rows.length === 0) {
      return false;
    }
    
    const user = userResult.rows[0];
    
    // Soft delete user in public schema
    const publicQuery = `
      UPDATE users
      SET active = false, updated_at = NOW()
      WHERE id = $1
    `;
    
    await client.query(publicQuery, [id]);
    
    // Get tenant schema name
    const schemaQuery = `
      SELECT schema_name FROM tenants WHERE id = $1
    `;
    
    const schemaResult = await client.query(schemaQuery, [user.tenant_id]);
    
    if (schemaResult.rows.length === 0) {
      throw new Error('Tenant not found');
    }
    
    const schemaName = schemaResult.rows[0].schema_name;
    
    // Soft delete user in tenant schema
    const tenantQuery = `
      UPDATE "${schemaName}".users
      SET active = false, updated_at = NOW()
      WHERE id = $1
    `;
    
    await client.query(tenantQuery, [id]);
    
    // Deactivate user-station assignments
    const stationsQuery = `
      UPDATE user_stations
      SET active = false, updated_at = NOW()
      WHERE user_id = $1
    `;
    
    await client.query(stationsQuery, [id]);
    
    // Deactivate user-station assignments in tenant schema
    const tenantStationsQuery = `
      UPDATE "${schemaName}".user_stations
      SET active = false, updated_at = NOW()
      WHERE user_id = $1
    `;
    
    await client.query(tenantStationsQuery, [id]);
    
    await client.query('COMMIT');
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', error);
    throw error;
  } finally {
    client.release();
  }
}