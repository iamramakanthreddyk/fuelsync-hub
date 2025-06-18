// src/routes/direct-admin-auth.routes.ts
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { generateUUID } from '../utils/uuid';

const router = Router();

// Direct admin login endpoint
router.post('/login', async (req, res) => {
  try {
    console.log('[DIRECT-ADMIN-AUTH] Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_CREDENTIALS',
        message: 'Email and password are required'
      });
    }
    
    // Find admin by email
    const query = `
      SELECT * FROM admin_users
      WHERE email = $1 AND active = true
    `;
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      console.log('[DIRECT-ADMIN-AUTH] Admin not found:', email);
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }
    
    const admin = result.rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isPasswordValid) {
      console.log('[DIRECT-ADMIN-AUTH] Invalid password for admin:', email);
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token with minimal payload
    const jwtSecret = process.env.ADMIN_JWT_SECRET || 'admin-local-dev-secret-do-not-use-in-production';
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role
      },
      jwtSecret,
      {
        expiresIn: '12h'
      }
    );
    
    // Calculate expiration time
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
    
    // Store token in admin_sessions
    const sessionQuery = `
      INSERT INTO admin_sessions (id, admin_id, token, expires_at)
      VALUES ($1, $2, $3, $4)
    `;
    
    await pool.query(sessionQuery, [generateUUID(), admin.id, token, expiresAt]);
    
    console.log('[DIRECT-ADMIN-AUTH] Admin authenticated successfully:', email);
    
    // Return admin data and token
    return res.status(200).json({
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
    });
  } catch (error) {
    console.error('[DIRECT-ADMIN-AUTH] Login error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred during login'
    });
  }
});

export default router;