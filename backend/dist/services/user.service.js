"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
// backend/src/services/user.service.ts
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = __importDefault(require("../config/environment"));
const uuid_1 = require("../utils/uuid");
const authenticateUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield database_1.default.connect();
    try {
        // First check if this is a super admin
        const adminResult = yield client.query('SELECT * FROM admin_users WHERE email = $1 AND active = true', [email]);
        if (adminResult.rows.length > 0) {
            const admin = adminResult.rows[0];
            const isMatch = yield bcrypt_1.default.compare(password, admin.password_hash);
            if (isMatch) {
                // Generate JWT token for admin
                const token = jsonwebtoken_1.default.sign({
                    id: admin.id,
                    email: admin.email,
                    role: admin.role,
                    isAdmin: true
                }, environment_1.default.jwtSecret, { expiresIn: environment_1.default.jwtExpiresIn });
                // Update last login
                yield client.query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [admin.id]);
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
      SELECT t.id, t.schema_name, t.plan_type
      FROM tenants t
      INNER JOIN LATERAL (
        SELECT true AS exists
        FROM pg_catalog.pg_namespace
        WHERE nspname = t.schema_name
      ) s ON true
      WHERE t.active = true
    `;
        const tenantsResult = yield client.query(tenantQuery);
        // Check each tenant schema for the user
        for (const tenant of tenantsResult.rows) {
            try {
                // Set search path to tenant schema
                yield client.query(`SET search_path TO ${tenant.schema_name}`);
                // Look for user in this tenant
                const userResult = yield client.query('SELECT * FROM users WHERE email = $1 AND active = true', [email]);
                if (userResult.rows.length > 0) {
                    const user = userResult.rows[0];
                    const isMatch = yield bcrypt_1.default.compare(password, user.password_hash);
                    if (isMatch) {
                        // Generate JWT token
                        const token = jsonwebtoken_1.default.sign({
                            id: user.id,
                            email: user.email,
                            role: user.role,
                            tenantId: tenant.id,
                            schemaName: tenant.schema_name,
                            planType: tenant.plan_type,
                            isAdmin: false
                        }, environment_1.default.jwtSecret, { expiresIn: environment_1.default.jwtExpiresIn });
                        // Update last login
                        yield client.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
                        // Create session
                        const sessionId = (0, uuid_1.generateUUID)();
                        yield client.query(`INSERT INTO user_sessions (id, user_id, ip_address, user_agent)
               VALUES ($1, $2, $3, $4)`, [sessionId, user.id, 'IP_ADDRESS', 'USER_AGENT'] // You would get these from request
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
                                planType: tenant.plan_type,
                                isAdmin: false
                            }
                        };
                    }
                }
            }
            catch (error) {
                console.error(`Error checking tenant ${tenant.schema_name}:`, error);
                // Continue checking other tenants
            }
        }
        // If we get here, user not found or password doesn't match
        throw new Error('Invalid email or password');
    }
    finally {
        client.release();
    }
});
exports.authenticateUser = authenticateUser;
