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
exports.getTenantById = exports.getAllTenants = exports.getTenantByEmail = exports.createTenant = void 0;
const database_1 = __importDefault(require("../config/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createTenant = (name, planType, ownerEmail, ownerPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield database_1.default.connect();
    try {
        yield client.query('BEGIN');
        // Create tenant and get schema
        const tenantResult = yield client.query('SELECT * FROM create_tenant($1, $2)', [name, planType]);
        const tenantId = tenantResult.rows[0].create_tenant;
        const schemaResult = yield client.query('SELECT schema_name FROM tenants WHERE id = $1', [tenantId]);
        const schemaName = schemaResult.rows[0].schema_name;
        // Apply schema template
        const templateSQL = fs_1.default.readFileSync(path_1.default.join(__dirname, '../../db/migrations/02_tenant_schema_template.sql'), 'utf8');
        yield client.query(`SET search_path TO ${schemaName}`);
        yield client.query(templateSQL);
        // Create owner user
        const passwordHash = yield bcrypt_1.default.hash(ownerPassword, 10);
        yield client.query(`INSERT INTO users (email, password_hash, role, first_name, last_name) 
       VALUES ($1, $2, 'owner', 'Owner', $3)`, [ownerEmail, passwordHash, name]);
        // Add subscription info
        yield client.query(`INSERT INTO subscription (plan_id, status) 
       VALUES ($1, 'active')`, [planType]);
        yield client.query('COMMIT');
        return { tenantId, schemaName };
    }
    catch (error) {
        yield client.query('ROLLBACK');
        console.error('Error creating tenant:', error);
        throw error;
    }
    finally {
        client.release();
    }
});
exports.createTenant = createTenant;
const getTenantByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield database_1.default.query(`SELECT t.id, t.name, t.schema_name, t.plan_type 
     FROM tenants t 
     JOIN admin_users au ON au.email = $1
     WHERE t.active = true`, [email]);
    return result.rows[0] || null;
});
exports.getTenantByEmail = getTenantByEmail;
const getAllTenants = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield database_1.default.connect();
    try {
        const result = yield client.query(`SELECT id, name, plan_type, schema_name, active, created_at, updated_at, contact_email, contact_phone
       FROM tenants
       ORDER BY created_at DESC`);
        return result.rows;
    }
    catch (error) {
        console.error('Error fetching all tenants:', error);
        throw error;
    }
    finally {
        client.release();
    }
});
exports.getAllTenants = getAllTenants;
const getTenantById = (tenantId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield database_1.default.query(`SELECT id, name, plan_type, schema_name, active, created_at, updated_at
     FROM tenants
     WHERE id = $1`, [tenantId]);
    return result.rows[0] || null;
});
exports.getTenantById = getTenantById;
