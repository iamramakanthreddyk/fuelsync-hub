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
exports.insertWithUUID = insertWithUUID;
exports.executeQuery = executeQuery;
exports.withTransaction = withTransaction;
const database_1 = __importDefault(require("../config/database"));
const uuid_1 = require("../utils/uuid");
/**
 * Inserts a record with an auto-generated UUID.
 *
 * @param schemaName Optional schema name (multi-tenant)
 * @param table Table name (unquoted string)
 * @param data Key-value data to insert
 * @param returningFields Optional comma-separated string of fields to return
 * @returns Inserted record or just ID
 */
function insertWithUUID(schemaName, table, data, returningFields) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.default.connect();
        try {
            if (schemaName) {
                yield client.query(`SET search_path TO "${schemaName}"`);
            }
            const id = (0, uuid_1.generateUUID)();
            const fullData = Object.assign({ id }, data);
            const columns = Object.keys(fullData);
            const values = Object.values(fullData);
            const placeholders = columns.map((_, i) => `$${i + 1}`);
            const returning = returningFields ? ` RETURNING ${returningFields}` : '';
            const query = `
      INSERT INTO "${table}" (${columns.map(col => `"${col}"`).join(', ')})
      VALUES (${placeholders.join(', ')})
      ${returning}
    `;
            const result = yield client.query(query, values);
            return returningFields ? result.rows[0] : { id };
        }
        catch (error) {
            console.error(`❌ Error inserting into ${table}:`, error);
            throw error;
        }
        finally {
            client.release();
        }
    });
}
/**
 * Executes a query with optional schema context.
 *
 * @param schemaName Optional schema to set as search_path
 * @param query SQL string with placeholders ($1, $2, ...)
 * @param params Parameter values for placeholders
 * @returns QueryResult
 */
function executeQuery(schemaName_1, query_1) {
    return __awaiter(this, arguments, void 0, function* (schemaName, query, params = []) {
        const client = yield database_1.default.connect();
        try {
            if (schemaName) {
                yield client.query(`SET search_path TO "${schemaName}"`);
            }
            return yield client.query(query, params);
        }
        catch (error) {
            console.error('❌ Query execution failed:', error);
            throw error;
        }
        finally {
            client.release();
        }
    });
}
/**
 * Runs an operation within a transaction and optional schema context.
 *
 * @param schemaName Optional schema
 * @param callback Function that receives a connected PoolClient
 * @returns Result of the callback
 */
function withTransaction(schemaName, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.default.connect();
        try {
            yield client.query('BEGIN');
            if (schemaName) {
                yield client.query(`SET search_path TO "${schemaName}"`);
            }
            const result = yield callback(client);
            yield client.query('COMMIT');
            return result;
        }
        catch (error) {
            yield client.query('ROLLBACK');
            console.error('❌ Transaction failed:', error);
            throw error;
        }
        finally {
            client.release();
        }
    });
}
