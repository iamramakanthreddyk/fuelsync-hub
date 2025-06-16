import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/environment';
import type { SignOptions } from 'jsonwebtoken';

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
    await client.query(`SET search_path TO ${schemaName}`);
    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
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
  const adminResult = await pool.query(
    'SELECT * FROM admin_users WHERE email = $1 AND active = true',
    [email]
  );
  if (adminResult.rows.length > 0) {
    const adminUser = adminResult.rows[0];
    const isMatch = await bcrypt.compare(password, adminUser.password_hash);
    if (isMatch) {
      const token = jwt.sign(
        { id: adminUser.id, email: adminUser.email, role: adminUser.role, isAdmin: true },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }  as SignOptions
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
    await client.query(`SET search_path TO ${tenant.schema_name}`);
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

    await client.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    await client.query(
      `INSERT INTO user_sessions (user_id, ip_address, user_agent)
       VALUES ($1, $2, $3)`,
      [user.id, 'IP_ADDRESS', 'USER_AGENT']
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenantId: tenant.id, isAdmin: false },
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
export const getUserById = async (schemaName: string, userId: string) => {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${schemaName}`);
    const result = await client.query(
      'SELECT id, email, role, first_name, last_name, created_at FROM users WHERE id = $1 AND active = true',
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  } finally {
    client.release();
  }
};