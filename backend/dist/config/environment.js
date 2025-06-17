"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d', // this is key!
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    database: {
        host: process.env.DB_HOST || 'fuelsync-server',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'fueladmin',
        password: process.env.DB_PASSWORD || '2304',
        database: process.env.DB_NAME || 'fuelsync'
    }
};
exports.default = config;
