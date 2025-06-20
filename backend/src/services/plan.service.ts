// backend/src/services/plan.service.ts - Fixed to use public schema
import { UserSession } from '../types/userSession';
import { PLAN_CONFIG, PlanType, PlanConfig, PLAN_TYPES } from '../config/planConfig';
import pool from '../config/database';

// Returns the effective plan config (custom or standard)
export function getEffectivePlan(user: UserSession, customPlan?: PlanConfig): PlanConfig {
  if (customPlan) return customPlan;
  if (user?.subscriptionPlan && PLAN_TYPES.includes(user.subscriptionPlan)) {
    return PLAN_CONFIG[user.subscriptionPlan as PlanType];
  }
  return PLAN_CONFIG['basic'];
}

export function hasPlanFeature(user: UserSession, feature: keyof PlanConfig, customPlan?: PlanConfig): boolean {
  const plan = getEffectivePlan(user, customPlan);
  return !!plan[feature];
}

// If tenant has a custom plan, use it for enforcement
export function getPlanType(user: UserSession, customPlan?: PlanConfig): PlanType | PlanConfig {
  if (customPlan) return customPlan;
  if (user?.subscriptionPlan && PLAN_TYPES.includes(user.subscriptionPlan)) {
    return user.subscriptionPlan as PlanType;
  }
  return 'basic';
}

// Fixed: Query stations from public schema using tenant_id
export async function getStationCount(tenantId: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) FROM public.stations WHERE tenant_id = $1 AND active = true`,
    [tenantId]
  );
  return parseInt(result.rows[0].count);
}

// Fixed: Query pumps from public schema
export async function getPumpCount(tenantId: string, stationId: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) FROM public.pumps p 
     JOIN public.stations s ON p.station_id = s.id 
     WHERE s.tenant_id = $1 AND p.station_id = $2 AND p.active = true`,
    [tenantId, stationId]
  );
  return parseInt(result.rows[0].count);
}

// Fixed: Query nozzles from public schema
export async function getNozzleCount(tenantId: string, pumpId: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) FROM public.nozzles n 
     JOIN public.pumps p ON n.pump_id = p.id 
     JOIN public.stations s ON p.station_id = s.id 
     WHERE s.tenant_id = $1 AND n.pump_id = $2 AND n.active = true`,
    [tenantId, pumpId]
  );
  return parseInt(result.rows[0].count);
}
