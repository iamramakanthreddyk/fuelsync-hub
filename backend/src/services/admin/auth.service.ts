// src/services/admin/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config/environment';
import pool from '../../config/database';
import { generateUUID } from '../../utils/uuid';

/**
 * Authenticate an admin user
 */
export async function authenticateAdmin(email: string, password: string) {
  try {
    // Find admin by email
    const query = `
      SELECT * FROM admin_users
      WHERE email = $1 AND active = true
    `;
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      throw { code: 'INVALID_CREDENTIALS' };
    }
    
    const admin = result.rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isPasswordValid) {
      throw { code: 'INVALID_CREDENTIALS' };
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role
      },
      config.admin.jwtSecret,
      {
        expiresIn: config.admin.jwtExpiresIn,
        audience: config.admin.jwtAudience,
        issuer: config.admin.jwtIssuer
      }
    );
    
    // Calculate expiration time
    const expiresIn = config.admin.jwtExpiresIn;
    const expiresInMs = expiresIn.endsWith('h')
      ? parseInt(expiresIn) * 60 * 60 * 1000
      : expiresIn.endsWith('m')
      ? parseInt(expiresIn) * 60 * 1000
      : parseInt(expiresIn) * 1000;
    
    const expiresAt = new Date(Date.now() + expiresInMs);
    
    // Store token in admin_sessions
    const sessionQuery = `
      INSERT INTO admin_sessions (id, admin_id, token, expires_at)
      VALUES ($1, $2, $3, $4)
    `;
    
    await pool.query(sessionQuery, [generateUUID(), admin.id, token, expiresAt]);
    
    // Return admin data and token
    return {
      status: 'success',
      data: {
        token: `Bearer ${token}`,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role
        }
      }
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    throw error;
  }
}

/**
 * Logout an admin user
 */
export async function logoutAdmin(adminId: string, token: string) {
  try {
    // Delete session
    const query = `
      DELETE FROM admin_sessions
      WHERE admin_id = $1 AND token = $2
    `;
    
    await pool.query(query, [adminId, token]);
    
    return true;
  } catch (error) {
    console.error('Admin logout error:', error);
    throw error;
  }
}

/**
 * Get admin by ID
 */
export async function getAdminById(id: string) {
  try {
    const query = `
      SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        active,
        created_at,
        updated_at
      FROM admin_users
      WHERE id = $1 AND active = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const admin = result.rows[0];
    
    // Get recent activity
    const activityQuery = `
      SELECT 
        id,
        action,
        entity_type,
        entity_id,
        created_at
      FROM admin_activity_logs
      WHERE admin_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const activityResult = await pool.query(activityQuery, [id]);
    
    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      role: admin.role,
      active: admin.active,
      createdAt: admin.created_at,
      updatedAt: admin.updated_at,
      recentActivity: activityResult.rows
    };
  } catch (error) {
    console.error('Get admin by ID error:', error);
    throw error;
  }
}