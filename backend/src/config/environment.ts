// src/config/environment.ts
import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
  database: {
    host: process.env.DB_HOST || 'fuelsync-server',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'fueladmin',
    password: process.env.DB_PASSWORD || '2304',
    database: process.env.DB_NAME || 'fuelsync'
  }
};
