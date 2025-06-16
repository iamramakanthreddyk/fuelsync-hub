import { Pool, PoolClient, QueryResult } from 'pg';
import { generateUUID } from '../utils/uuid';
import pool from '../config/database';

/**
 * Inserts a record with an auto-generated UUID.
 * Optionally return specific columns using `returningFields`.
 *
 * @param schemaName Schema name (for multi-tenant)
 * @param table Table name
 * @param data Key-value object (excluding `id`)
 * @param returningFields Optional comma-separated string of columns to return (e.g., 'id, name')
 * @returns Inserted record (or just UUID if no return fields specified)
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
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      ${returning}
    `;

    const result = await client.query(query, values);
    return returningFields ? result.rows[0] : { id };
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Executes a SQL query with optional schema context.
 *
 * @param schemaName Schema to set as search_path (optional)
 * @param query SQL string
 * @param params Parameterized values
 * @returns Query result
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
    console.error('Error executing query:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Runs a callback function within a transaction with schema context.
 *
 * @param schemaName Schema to use as search_path (optional)
 * @param callback Callback that receives the DB client
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
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
