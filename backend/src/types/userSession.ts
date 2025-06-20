// src/types/userSession.ts

export interface UserSession {
  id: string;
  email: string;
  role: 'superadmin' | 'owner' | 'manager' | 'employee';
  subscriptionPlan?: 'basic' | 'premium' | 'enterprise';
  isAdmin?: boolean;
  [key: string]: any;
}
