import { withTransaction, executeQuery } from './db.service';
import { v4 as uuidv4 } from 'uuid';

interface Creditor {
  id: string;
  station_id: string;
  party_name: string;
  contact_person?: string;
  contact_phone?: string;
  email?: string;
  address?: string;
  credit_limit?: number;
  running_balance: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  last_updated_at: Date;
}

interface Payment {
  id: string;
  creditor_id: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  recorded_by: string;
  notes?: string;
  created_at: Date;
}

export const createCreditor = async (
  schemaName: string,
  stationId: string,
  partyName: string,
  contactPerson?: string,
  contactPhone?: string,
  email?: string,
  address?: string,
  creditLimit?: number,
  notes?: string
): Promise<Creditor> => {
  return withTransaction(schemaName, async (client) => {
    const id = uuidv4();
    
    const result = await client.query(
      `INSERT INTO creditors (
        id, station_id, party_name, contact_person, contact_phone, email, address,
        credit_limit, running_balance, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id, stationId, partyName, contactPerson || null, contactPhone || null,
        email || null, address || null, creditLimit || null, 0, notes || null
      ]
    );
    
    return result.rows[0];
  });
};

export const getCreditors = async (schemaName: string): Promise<Creditor[]> => {
  const query = `
    SELECT * FROM creditors
    ORDER BY party_name ASC
  `;
  
  const result = await executeQuery(schemaName, query);
  return result.rows;
};

export const getCreditorById = async (
  schemaName: string,
  creditorId: string
): Promise<Creditor | null> => {
  const query = `
    SELECT * FROM creditors
    WHERE id = $1
  `;
  
  const result = await executeQuery(schemaName, query, [creditorId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const updateCreditor = async (
  schemaName: string,
  creditorId: string,
  updates: {
    partyName?: string;
    contactPerson?: string;
    contactPhone?: string;
    email?: string;
    address?: string;
    creditLimit?: number;
    notes?: string;
  }
): Promise<Creditor | null> => {
  return withTransaction(schemaName, async (client) => {
    // First check if creditor exists
    const checkResult = await client.query(
      `SELECT id FROM creditors WHERE id = $1`,
      [creditorId]
    );
    
    if (checkResult.rows.length === 0) {
      return null;
    }
    
    // Build update query dynamically based on provided fields
    const updateFields = [];
    const queryParams = [creditorId];
    let paramIndex = 2;
    
    if (updates.partyName !== undefined) {
      updateFields.push(`party_name = $${paramIndex++}`);
      queryParams.push(updates.partyName);
    }
    
    if (updates.contactPerson !== undefined) {
      updateFields.push(`contact_person = $${paramIndex++}`);
      queryParams.push(updates.contactPerson || null);
    }
    
    if (updates.contactPhone !== undefined) {
      updateFields.push(`contact_phone = $${paramIndex++}`);
      queryParams.push(updates.contactPhone || null);
    }
    
    if (updates.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      queryParams.push(updates.email || null);
    }
    
    if (updates.address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      queryParams.push(updates.address || null);
    }
    
    if (updates.creditLimit !== undefined) {
      updateFields.push(`credit_limit = $${paramIndex++}`);
      queryParams.push(updates.creditLimit || null);
    }
    
    if (updates.notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      queryParams.push(updates.notes || null);
    }
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    if (updateFields.length === 0) {
      // No fields to update
      const getResult = await client.query(
        `SELECT * FROM creditors WHERE id = $1`,
        [creditorId]
      );
      return getResult.rows[0];
    }
    
    const updateQuery = `
      UPDATE creditors
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, queryParams);
    return result.rows[0];
  });
};

export const recordPayment = async (
  schemaName: string,
  creditorId: string,
  amount: number,
  paymentMethod: string,
  recordedBy: string,
  referenceNumber?: string,
  notes?: string
): Promise<Payment> => {
  return withTransaction(schemaName, async (client) => {
    // First check if creditor exists
    const checkResult = await client.query(
      `SELECT id, running_balance FROM creditors WHERE id = $1`,
      [creditorId]
    );
    
    if (checkResult.rows.length === 0) {
      throw new Error('Creditor not found');
    }
    
    const currentBalance = parseFloat(checkResult.rows[0].running_balance);
    
    // Insert payment record
    const paymentId = uuidv4();
    const paymentResult = await client.query(
      `INSERT INTO creditor_payments (
        id, creditor_id, amount, payment_method, reference_number,
        recorded_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        paymentId, creditorId, amount, paymentMethod,
        referenceNumber || null, recordedBy, notes || null
      ]
    );
    
    // Update creditor balance
    const newBalance = Math.max(0, currentBalance - amount);
    await client.query(
      `UPDATE creditors
       SET running_balance = $1, last_updated_at = NOW()
       WHERE id = $2`,
      [newBalance, creditorId]
    );
    
    return paymentResult.rows[0];
  });
};

export const getPaymentHistory = async (
  schemaName: string,
  creditorId: string
): Promise<Payment[]> => {
  const query = `
    SELECT cp.*, u.first_name || ' ' || u.last_name as recorded_by_name
    FROM creditor_payments cp
    JOIN users u ON cp.recorded_by = u.id
    WHERE cp.creditor_id = $1
    ORDER BY cp.created_at DESC
  `;
  
  const result = await executeQuery(schemaName, query, [creditorId]);
  return result.rows;
};