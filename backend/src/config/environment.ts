import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  nodeEnv: string;
  port: number;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    audience: string;
    issuer: string;
  };
  admin: {
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtAudience: string;
    jwtIssuer: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

// Default values for local development only
const getEnvWithFallback = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === 'production') {
    console.warn(`[CONFIG] Warning: ${key} is not set in production environment`);
  }
  return value || fallback;
};

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  db: {
    host: getEnvWithFallback('DB_HOST', 'localhost'),
    port: parseInt(getEnvWithFallback('DB_PORT', '5432'), 10),
    user: getEnvWithFallback('DB_USER', 'postgres'),
    password: getEnvWithFallback('DB_PASSWORD', 'postgres'),
    database: getEnvWithFallback('DB_NAME', 'fuelsync_db'),
    ssl: process.env.DB_SSL === 'true'
  },
  
  jwt: {
    // In production, this should be set via environment variable
    secret: getEnvWithFallback('JWT_SECRET', 'local-dev-secret-do-not-use-in-production'),
    expiresIn: getEnvWithFallback('JWT_EXPIRES_IN', '24h'),
    audience: getEnvWithFallback('JWT_AUDIENCE', 'fuelsync-tenant-api'),
    issuer: getEnvWithFallback('JWT_ISSUER', 'fuelsync-auth')
  },
  
  admin: {
    // In production, this should be set via environment variable
    jwtSecret: getEnvWithFallback('ADMIN_JWT_SECRET', 'admin-local-dev-secret-do-not-use-in-production'),
    jwtExpiresIn: getEnvWithFallback('ADMIN_JWT_EXPIRES_IN', '12h'),
    jwtAudience: getEnvWithFallback('ADMIN_JWT_AUDIENCE', 'fuelsync-admin-api'),
    jwtIssuer: getEnvWithFallback('ADMIN_JWT_ISSUER', 'fuelsync-admin-auth')
  },
  
  rateLimit: {
    windowMs: parseInt(getEnvWithFallback('RATE_LIMIT_WINDOW_MS', (15 * 60 * 1000).toString()), 10), // 15 minutes
    max: parseInt(getEnvWithFallback('RATE_LIMIT_MAX', '100'), 10)
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true
  }
};