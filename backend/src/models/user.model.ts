import pool from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'superadmin' | 'owner' | 'manager' | 'employee';
  first_name: string;
  last_name: string;
  active: boolean;
  tenant_id?: string;
  tenant_name?: string;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT 
          u.*,
          t.name as tenant_name 
        FROM public.users u 
        LEFT JOIN public.tenants t ON t.id = u.tenant_id 
        WHERE u.email = $1 AND u.active = true`;
      
      const { rows } = await pool.query(query, [email]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<User | null> {
    try {
      const query = `
        SELECT 
          u.*,
          t.name as tenant_name 
        FROM public.users u 
        LEFT JOIN public.tenants t ON t.id = u.tenant_id 
        WHERE u.id = $1 AND u.active = true`;
      
      const { rows } = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  static async findByTenant(tenantId: string): Promise<User[]> {
    try {
      const query = `
        SELECT 
          u.*,
          t.name as tenant_name 
        FROM public.users u 
        LEFT JOIN public.tenants t ON t.id = u.tenant_id 
        WHERE u.tenant_id = $1 AND u.active = true`;
      
      const { rows } = await pool.query(query, [tenantId]);
      return rows;
    } catch (error) {
      console.error('Error in findByTenant:', error);
      throw error;
    }
  }
}