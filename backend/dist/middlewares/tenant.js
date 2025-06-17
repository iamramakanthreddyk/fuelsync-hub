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
exports.setTenantContext = void 0;
const database_1 = __importDefault(require("../config/database"));
const setTenantContext = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    try {
        // For admin users, we don't set a tenant context
        if (req.user.isAdmin) {
            return next();
        }
        // For tenant users, get schema name from tenantId
        const result = yield database_1.default.query('SELECT schema_name FROM tenants WHERE id = $1 AND active = true', [req.user.tenantId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant not found or inactive' });
        }
        req.tenantId = req.user.tenantId;
        req.schemaName = result.rows[0].schema_name;
        // Set search path for this connection
        yield database_1.default.query(`SET search_path TO ${req.schemaName}, public`);
        next();
    }
    catch (error) {
        console.error('Error setting tenant context:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.setTenantContext = setTenantContext;
