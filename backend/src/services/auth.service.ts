import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel } from '../models/user.model';
import { config } from '../config/environment';
import { JWTPayload } from '../types/jwt-payload';

/**
 * Authentication error class
 */
export class AuthError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 401, code = 'AUTHENTICATION_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Authenticate a tenant user with email and password
 */
export async function authenticateTenantUser(email: string, password: string) {
  const requestId = crypto.randomUUID();
  
  try {
    // Find user by email
    const user = await UserModel.findByEmail(email);
    
    if (!user) {
      throw new AuthError('Invalid credentials', 401, 'USER_NOT_FOUND');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.tenant_id) {
      throw new AuthError('Account setup is incomplete. Please contact support.', 400, 'ACCOUNT_SETUP_INCOMPLETE');
    }

    // Create JWT payload
    const payload: JWTPayload = {
      id: user.id,
      role: user.role,
      tenant_id: user.tenant_id,
      email: user.email
    };

    // Sign JWT token
    const token = generateToken(payload);

    // Return user data and token
    return {
      status: 'success',
      data: {
        token: `Bearer ${token}`,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenant_id: user.tenant_id,
          tenant_name: user.tenant_name,
          first_name: user.first_name,
          last_name: user.last_name
        }
      }
    };
  } catch (error) {
    console.error('[AUTH] Authentication error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      email
    });
    
    // Re-throw AuthError instances, wrap other errors
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError(
      'An unexpected error occurred during authentication',
      500,
      'SERVER_ERROR'
    );
  }
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
    audience: config.jwt.audience,
    issuer: config.jwt.issuer
  };

  return jwt.sign(payload, config.jwt.secret as jwt.Secret, options);
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'],
      audience: config.jwt.audience,
      issuer: config.jwt.issuer
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token has expired', 401, 'TOKEN_EXPIRED');
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError(`Token validation failed: ${error.message}`, 401, 'INVALID_TOKEN');
    }
    
    throw error;
  }
}