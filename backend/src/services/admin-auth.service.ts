// src/services/admin-auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

class AuthError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

/**
 * Authenticate an admin user
 */
export async function authenticateAdmin(email: string, password: string) {
  try {
    console.log(`[ADMIN-AUTH-SERVICE] Authenticating admin: ${email}`);
    
    // Find admin by email
    const query = `
      SELECT * FROM admin_users
      WHERE email = $1 AND active = true
    `;
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      console.log(`[ADMIN-AUTH-SERVICE] Admin not found: ${email}`);
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }
    
    const admin = result.rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isPasswordValid) {
      console.log(`[ADMIN-AUTH-SERVICE] Invalid password for admin: ${email}`);
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        isAdmin: true
      },
      process.env.ADMIN_JWT_SECRET || 'admin-secret',
      {
        expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '12h',
        audience: 'fuelsync-admin-api',
        issuer: 'fuelsync-admin-auth'
      }
    );
    
    console.log(`[ADMIN-AUTH-SERVICE] Admin authenticated successfully: ${email}`);
    
    // Return admin data and token
    return {
      status: 'success',
      data: {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role
        }
      }
    };
  } catch (error) {
    console.error(`[ADMIN-AUTH-SERVICE] Authentication error:`, error);
    throw error;
  }
}

/**
 * Logout an admin user
 */
export async function logoutAdmin(adminId: string, token: string) {
  try {
    // For now, just return success since we don't have session storage
    // In production, you'd want to blacklist the token
    console.log(`[ADMIN-AUTH-SERVICE] Admin logged out: ${adminId}`);
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
    
    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      role: admin.role,
      active: admin.active,
      createdAt: admin.created_at,
      updatedAt: admin.updated_at
    };
  } catch (error) {
    console.error('Get admin by ID error:', error);
    throw error;
  }
}