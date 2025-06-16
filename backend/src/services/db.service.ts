import { Pool, PoolClient, QueryResult } from 'pg';
import pool from '../config/database';
import { generateUUID } from '../utils/uuid';

/**
 * Inserts a record with an auto-generated UUID.
 *
 * @param schemaName Optional schema name (multi-tenant)
 * @param table Table name (unquoted string)
 * @param data Key-value data to insert
 * @param returningFields Optional comma-separated string of fields to return
 * @returns Inserted record or just ID
 */
export async function insertWithUUID(
  schemaName: string | null,
  table: string,
  data: Record<string, any>,
  returningFields?: string
): Promise<any> {
  const client = await pool.connect();
  try {
    if (schemaName) {
      await client.query(`SET search_path TO "${schemaName}"`);
    }

    const id = generateUUID();
    const fullData = { id, ...data };
    const columns = Object.keys(fullData);
    const values = Object.values(fullData);
    const placeholders = columns.map((_, i) => `$${i + 1}`);

    const returning = returningFields ? ` RETURNING ${returningFields}` : '';
    const query = `
      INSERT INTO "${table}" (${columns.map(col => `"${col}"`).join(', ')})
      VALUES (${placeholders.join(', ')})
      ${returning}
    `;

    const result = await client.query(query, values);
    return returningFields ? result.rows[0] : { id };
  } catch (error) {
    console.error(`❌ Error inserting into ${table}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Executes a query with optional schema context.
 *
 * @param schemaName Optional schema to set as search_path
 * @param query SQL string with placeholders ($1, $2, ...)
 * @param params Parameter values for placeholders
 * @returns QueryResult
 */
export async function executeQuery(
  schemaName: string | null,
  query: string,
  params: any[] = []
): Promise<QueryResult> {
  const client = await pool.connect();
  try {
    if (schemaName) {
      await client.query(`SET search_path TO "${schemaName}"`);
    }

    return await client.query(query, params);
  } catch (error) {
    console.error('❌ Query execution failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Runs an operation within a transaction and optional schema context.
 *
 * @param schemaName Optional schema
 * @param callback Function that receives a connected PoolClient
 * @returns Result of the callback
 */
export async function withTransaction<T>(
  schemaName: string | null,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (schemaName) {
      await client.query(`SET search_path TO "${schemaName}"`);
    }

    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
