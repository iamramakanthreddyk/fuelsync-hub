// src/services/admin/station.service.ts
import pool from '../../config/database';
import { generateUUID } from '../../utils/uuid';

interface StationCreateParams {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contactPhone: string;
  tenantId: string;
  location: any;
  operatingHours: any;
}

interface StationUpdateParams {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contactPhone?: string;
  location?: any;
  operatingHours?: any;
  active?: boolean;
}

/**
 * Get stations with pagination, search, and tenant filtering
 */
export async function getStations(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  tenantId: string = ''
) {
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT 
      s.id, 
      s.name, 
      s.address, 
      s.city, 
      s.state, 
      s.zip, 
      s.contact_phone,
      s.tenant_id,
      s.active,
      s.created_at,
      s.updated_at,
      t.name as tenant_name
    FROM stations s
    JOIN tenants t ON s.tenant_id = t.id
    WHERE 1=1
  `;
  
  const queryParams: any[] = [];
  let paramIndex = 1;
  
  // Add search condition if provided
  if (search) {
    query += ` AND (
      s.name ILIKE $${paramIndex} OR
      s.address ILIKE $${paramIndex} OR
      s.city ILIKE $${paramIndex}
    )`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }
  
  // Add tenant filter if provided
  if (tenantId) {
    query += ` AND s.tenant_id = $${paramIndex}`;
    queryParams.push(tenantId);
    paramIndex++;
  }
  
  // Add pagination
  query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);
  
  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(*) as total
    FROM stations s
    WHERE 1=1
  `;
  
  let countParams: any[] = [];
  let countParamIndex = 1;
  
  // Add search condition if provided
  if (search) {
    countQuery += ` AND (
      s.name ILIKE $${countParamIndex} OR
      s.address ILIKE $${countParamIndex} OR
      s.city ILIKE $${countParamIndex}
    )`;
    countParams.push(`%${search}%`);
    countParamIndex++;
  }
  
  // Add tenant filter if provided
  if (tenantId) {
    countQuery += ` AND s.tenant_id = $${countParamIndex}`;
    countParams.push(tenantId);
  }
  
  try {
    const [stationsResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams)
    ]);
    
    const stations = stationsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    
    return {
      stations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting stations:', error);
    throw error;
  }
}

/**
 * Get station by ID
 */
export async function getStationById(id: string) {
  try {
    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.address, 
        s.city, 
        s.state, 
        s.zip, 
        s.contact_phone,
        s.location,
        s.operating_hours,
        s.tenant_id,
        s.active,
        s.created_at,
        s.updated_at,
        t.name as tenant_name
      FROM stations s
      JOIN tenants t ON s.tenant_id = t.id
      WHERE s.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const station = result.rows[0];
    
    // Get pumps for this station
    const pumpsQuery = `
      SELECT 
        id,
        name,
        serial_number,
        installation_date,
        last_maintenance_date,
        next_maintenance_date,
        status,
        active
      FROM pumps
      WHERE station_id = $1 AND active = true
    `;
    
    const pumpsResult = await pool.query(pumpsQuery, [id]);
    
    // Get users assigned to this station
    const usersQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        us.role as station_role
      FROM user_stations us
      JOIN users u ON us.user_id = u.id
      WHERE us.station_id = $1 AND us.active = true
    `;
    
    const usersResult = await pool.query(usersQuery, [id]);
    
    return {
      ...station,
      pumps: pumpsResult.rows,
      users: usersResult.rows
    };
  } catch (error) {
    console.error('Error getting station by ID:', error);
    throw error;
  }
}

/**
 * Create a new station
 */
export async function createStation(params: StationCreateParams) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Generate UUID
    const stationId = generateUUID();
    
    // Insert station into public schema
    const publicQuery = `
      INSERT INTO stations (
        id, 
        name, 
        address, 
        city, 
        state, 
        zip, 
        contact_phone,
        location,
        operating_hours,
        tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id, 
        name, 
        address, 
        city, 
        state, 
        zip, 
        contact_phone,
        tenant_id,
        active,
        created_at,
        updated_at
    `;
    
    const publicResult = await client.query(publicQuery, [
      stationId,
      params.name,
      params.address,
      params.city,
      params.state,
      params.zip,
      params.contactPhone,
      JSON.stringify(params.location),
      JSON.stringify(params.operatingHours),
      params.tenantId
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
    
    // Insert station into tenant schema
    const tenantQuery = `
      INSERT INTO "${schemaName}".stations (
        id, 
        name, 
        address, 
        city, 
        state, 
        zip, 
        contact_phone,
        location,
        operating_hours,
        tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    
    await client.query(tenantQuery, [
      stationId,
      params.name,
      params.address,
      params.city,
      params.state,
      params.zip,
      params.contactPhone,
      JSON.stringify(params.location),
      JSON.stringify(params.operatingHours),
      params.tenantId
    ]);
    
    await client.query('COMMIT');
    
    return publicResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating station:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update a station
 */
export async function updateStation(id: string, params: StationUpdateParams) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get current station data
    const stationQuery = `
      SELECT * FROM stations WHERE id = $1
    `;
    
    const stationResult = await client.query(stationQuery, [id]);
    
    if (stationResult.rows.length === 0) {
      return null;
    }
    
    const station = stationResult.rows[0];
    
    // Build update query
    const updates: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;
    
    if (params.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(params.name);
    }
    
    if (params.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(params.address);
    }
    
    if (params.city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      values.push(params.city);
    }
    
    if (params.state !== undefined) {
      updates.push(`state = $${paramIndex++}`);
      values.push(params.state);
    }
    
    if (params.zip !== undefined) {
      updates.push(`zip = $${paramIndex++}`);
      values.push(params.zip);
    }
    
    if (params.contactPhone !== undefined) {
      updates.push(`contact_phone = $${paramIndex++}`);
      values.push(params.contactPhone);
    }
    
    if (params.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(JSON.stringify(params.location));
    }
    
    if (params.operatingHours !== undefined) {
      updates.push(`operating_hours = $${paramIndex++}`);
      values.push(JSON.stringify(params.operatingHours));
    }
    
    if (params.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(params.active);
    }
    
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 0) {
      return station;
    }
    
    // Update station in public schema
    const publicQuery = `
      UPDATE stations
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING 
        id, 
        name, 
        address, 
        city, 
        state, 
        zip, 
        contact_phone,
        tenant_id,
        active,
        created_at,
        updated_at
    `;
    
    const publicResult = await client.query(publicQuery, values);
    
    // Get tenant schema name
    const schemaQuery = `
      SELECT schema_name FROM tenants WHERE id = $1
    `;
    
    const schemaResult = await client.query(schemaQuery, [station.tenant_id]);
    
    if (schemaResult.rows.length === 0) {
      throw new Error('Tenant not found');
    }
    
    const schemaName = schemaResult.rows[0].schema_name;
    
    // Update station in tenant schema
    const tenantQuery = `
      UPDATE "${schemaName}".stations
      SET ${updates.join(', ')}
      WHERE id = $1
    `;
    
    await client.query(tenantQuery, values);
    
    await client.query('COMMIT');
    
    return publicResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating station:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a station
 */
export async function deleteStation(id: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get station data
    const stationQuery = `
      SELECT * FROM stations WHERE id = $1
    `;
    
    const stationResult = await client.query(stationQuery, [id]);
    
    if (stationResult.rows.length === 0) {
      return false;
    }
    
    const station = stationResult.rows[0];
    
    // Soft delete station in public schema
    const publicQuery = `
      UPDATE stations
      SET active = false, updated_at = NOW()
      WHERE id = $1
    `;
    
    await client.query(publicQuery, [id]);
    
    // Get tenant schema name
    const schemaQuery = `
      SELECT schema_name FROM tenants WHERE id = $1
    `;
    
    const schemaResult = await client.query(schemaQuery, [station.tenant_id]);
    
    if (schemaResult.rows.length === 0) {
      throw new Error('Tenant not found');
    }
    
    const schemaName = schemaResult.rows[0].schema_name;
    
    // Soft delete station in tenant schema
    const tenantQuery = `
      UPDATE "${schemaName}".stations
      SET active = false, updated_at = NOW()
      WHERE id = $1
    `;
    
    await client.query(tenantQuery, [id]);
    
    await client.query('COMMIT');
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting station:', error);
    throw error;
  } finally {
    client.release();
  }
}