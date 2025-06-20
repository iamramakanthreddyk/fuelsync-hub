/**
 * JWT Payload type definition
 * Used for both tenant users and admin users
 */
import type { PlanType } from '../config/planConfig';

export interface JWTPayload {
  /** User ID */
  id: string;
  
  /** User role (owner, manager, employee, superadmin) */
  role: string;
  
  /** Tenant ID the user belongs to (not present for admin users) */
  tenant_id?: string;

  /** Tenant name included in some tokens */
  tenant_name?: string;

  /** Subscription plan for the tenant */
  subscriptionPlan?: PlanType;
  
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