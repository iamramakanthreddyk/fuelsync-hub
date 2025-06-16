import pool from '../config/database';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

export const createTenant = async (
  name: string,
  planType: string,
  ownerEmail: string,
  ownerPassword: string
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create tenant and get schema
    const tenantResult = await client.query(
      'SELECT * FROM create_tenant($1, $2)',
      [name, planType]
    );
    const tenantId = tenantResult.rows[0].create_tenant;

    const schemaResult = await client.query(
      'SELECT schema_name FROM tenants WHERE id = $1',
      [tenantId]
    );
    const schemaName = schemaResult.rows[0].schema_name;

    // Apply schema template
    const templateSQL = fs.readFileSync(
      path.join(__dirname, '../../db/migrations/02_tenant_schema_template.sql'),
      'utf8'
    );
    await client.query(`SET search_path TO ${schemaName}`);
    await client.query(templateSQL);

    // Create owner user
    const passwordHash = await bcrypt.hash(ownerPassword, 10);
    await client.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name) 
       VALUES ($1, $2, 'owner', 'Owner', $3)`,
      [ownerEmail, passwordHash, name]
    );

    // Add subscription info
    await client.query(
      `INSERT INTO subscription (plan_id, status) 
       VALUES ($1, 'active')`,
      [planType]
    );

    await client.query('COMMIT');
    return { tenantId, schemaName };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tenant:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getTenantByEmail = async (email: string) => {
  const result = await pool.query(
    `SELECT t.id, t.name, t.schema_name, t.plan_type 
     FROM tenants t 
     JOIN admin_users au ON au.email = $1
     WHERE t.active = true`,
    [email]
  );

  return result.rows[0] || null;
};

export const getAllTenants = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id, name, plan_type, schema_name, active, created_at, updated_at, contact_email, contact_phone
       FROM tenants
       ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching all tenants:', error);
    throw error;
  } finally {
    client.release();
  }
};
export const getTenantById = async (tenantId: string) => {
  const result = await pool.query(
    `SELECT id, name, plan_type, schema_name, active, created_at, updated_at
     FROM tenants
     WHERE id = $1`,
    [tenantId]
  );

  return result.rows[0] || null;
};