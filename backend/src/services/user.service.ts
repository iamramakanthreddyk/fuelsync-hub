// src/services/user.service.ts
import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/environment';

export const createUser = async (
  schemaName: string, 
  email: string, 
  password: string, 
  role: string, 
  firstName: string, 
  lastName: string
) => {
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${schemaName}`);
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    
    // Create user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, first_name, last_name, created_at`,
      [email, passwordHash, role, firstName, lastName]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const authenticateUser = async (email: string, password: string) => {
  // First, try to find admin user
  const adminResult = await pool.query(
    'SELECT * FROM admin_users WHERE email = $1 AND active = true',
    [email]
  );
  
  if (adminResult.rows.length > 0) {
    const adminUser = adminResult.rows[0];
    const isMatch = await bcrypt.compare(password, adminUser.password_hash);
    
    if (isMatch) {
      // Generate JWT token for admin
      const token = jwt.sign(
        { 
          id: adminUser.id, 
          email: adminUser.email, 
          role: adminUser.role,
          isAdmin: true 
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );
      
      return {
        token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          isAdmin: true
        }
      };
    }
  }
  
  // If not admin, try to find tenant user
  // We need to find which tenant schema to look in
  const tenantResult = await pool.query(
    `SELECT t.id, t.schema_name 
     FROM tenants t 
     JOIN users u ON u.email = $1
     WHERE t.active = true`,
    [email]
  );
  
  if (tenantResult.rows.length === 0) {
    throw new Error('User not found');
  }
  
  const tenant = tenantResult.rows[0];
  const client = await pool.connect();
  
  try {
    // Set search path to tenant schema
    await client.query(`SET search_path TO ${tenant.schema_name}`);
    
    // Find user
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1 AND active = true',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      throw new Error('Invalid password');
    }
    
    // Update last login
    await client.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Create session record
    await client.query(
      `INSERT INTO user_sessions (user_id, ip_address, user_agent)
       VALUES ($1, $2, $3)`,
      [user.id, 'IP_ADDRESS', 'USER_AGENT'] // These would come from the request
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        tenantId: tenant.id,
        isAdmin: false 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
        isAdmin: false
      }
    };
  } finally {
    client.release();
  }
};