// backend/src/services/user.service.ts
import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { generateUUID } from '../utils/uuid';

export const authenticateUser = async (email: string, password: string) => {
  const client = await pool.connect();
  
  try {
    // First check if this is a super admin
    const adminResult = await client.query(
      'SELECT * FROM admin_users WHERE email = $1 AND active = true',
      [email]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      
      if (isMatch) {
        // Generate JWT token for admin
        const token = jwt.sign(
          { 
            id: admin.id, 
            email: admin.email, 
            role: admin.role,
            isAdmin: true 
          },
          config.jwtSecret,
          { expiresIn: config.jwtExpiresIn }
        );
        
        // Update last login
        await client.query(
          'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
          [admin.id]
        );
        
        return {
          token,
          user: {
            id: admin.id,
            email: admin.email,
            firstName: admin.first_name,
            lastName: admin.last_name,
            role: admin.role,
            isAdmin: true
          }
        };
      }
    }
    
    // If not an admin, find which tenant this user belongs to
    const tenantQuery = `
      SELECT t.id, t.schema_name, t.subscription_plan
      FROM tenants t
      INNER JOIN LATERAL (
        SELECT true AS exists
        FROM pg_catalog.pg_namespace
        WHERE nspname = t.schema_name
      ) s ON true
      WHERE t.active = true
    `;
    
    const tenantsResult = await client.query(tenantQuery);
    
    // Check each tenant schema for the user
    for (const tenant of tenantsResult.rows) {
      try {
        // Set search path to tenant schema
        await client.query(`SET search_path TO ${tenant.schema_name}`);
        
        // Look for user in this tenant
        const userResult = await client.query(
          'SELECT * FROM users WHERE email = $1 AND active = true',
          [email]
        );
        
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          const isMatch = await bcrypt.compare(password, user.password_hash);
          
          if (isMatch) {
            // Generate JWT token
            const token = jwt.sign(
              { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                tenantId: tenant.id,
                schemaName: tenant.schema_name,
                subscriptionPlan: tenant.subscription_plan,
                isAdmin: false 
              },
              config.jwtSecret,
              { expiresIn: config.jwtExpiresIn }
            );
            
            // Update last login
            await client.query(
              'UPDATE users SET last_login = NOW() WHERE id = $1',
              [user.id]
            );
            
            // Create session
            const sessionId = generateUUID();
            await client.query(
              `INSERT INTO user_sessions (id, user_id, ip_address, user_agent)
               VALUES ($1, $2, $3, $4)`,
              [sessionId, user.id, 'IP_ADDRESS', 'USER_AGENT'] // You would get these from request
            );
            
            return {
              token,
              user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                tenantId: tenant.id,
                schemaName: tenant.schema_name,
                subscriptionPlan: tenant.subscription_plan,
                isAdmin: false
              }
            };
          }
        }
      } catch (error) {
        console.error(`Error checking tenant ${tenant.schema_name}:`, error);
        // Continue checking other tenants
      }
    }
    
    // If we get here, user not found or password doesn't match
    throw new Error('Invalid email or password');
  } finally {
    client.release();
  }
};

/* ─────────────────────────────────  GET USER BY ID  ───────────────────────────────── */


export const getUserById = async (userId: string) => {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT u.*, t.name AS tenant_name 
      FROM users u 
      LEFT JOIN tenants t ON t.id = u.tenant_id 
      WHERE u.id = $1 AND u.active = true
    `;
    
    const { rows } = await client.query(query, [userId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  } finally {
    client.release();
  }
}