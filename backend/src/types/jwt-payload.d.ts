/**
 * JWT Payload type definition
 * Used for both tenant users and admin users
 */
export interface JWTPayload {
  /** User ID */
  id: string;
  
  /** User role (owner, manager, employee, superadmin) */
  role: string;
  
  /** Tenant ID the user belongs to (not present for admin users) */
  tenant_id?: string;
  
  /** User email (optional for backward compatibility) */
  email?: string;
  
  /** Whether this token is for an admin user */
  isAdmin?: boolean;
  
  /** JWT standard fields */
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
}