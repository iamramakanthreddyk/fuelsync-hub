// backend/src/services/plan.service.ts
import { UserSession } from '../types/userSession';
import { PLAN_CONFIG, PlanType, PlanConfig, PLAN_TYPES } from '../config/planConfig';
import pool from '../config/database';

// Returns the effective plan config (custom or standard)
export function getEffectivePlan(user: UserSession, customPlan?: PlanConfig): PlanConfig {
  if (customPlan) return customPlan;
  if (user?.planType && PLAN_TYPES.includes(user.planType)) {
    return PLAN_CONFIG[user.planType as PlanType];
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
  if (user?.planType && PLAN_TYPES.includes(user.planType)) {
    return user.planType as PlanType;
  }
  return 'basic';
}

export async function getStationCount(schemaName: string): Promise<number> {
  const result = await pool.query(
    `SET search_path TO ${schemaName}; SELECT COUNT(*) FROM stations WHERE active = true AND deleted_at IS NULL`
  );
  return parseInt(result.rows[0].count);
}

export async function getPumpCount(schemaName: string, stationId: string): Promise<number> {
  const result = await pool.query(
    `SET search_path TO ${schemaName}; SELECT COUNT(*) FROM pumps WHERE station_id = $1 AND active = true AND deleted_at IS NULL`,
    [stationId]
  );
  return parseInt(result.rows[0].count);
}

export async function getNozzleCount(schemaName: string, pumpId: string): Promise<number> {
  const result = await pool.query(
    `SET search_path TO ${schemaName}; SELECT COUNT(*) FROM nozzles WHERE pump_id = $1 AND active = true AND deleted_at IS NULL`,
    [pumpId]
  );
  return parseInt(result.rows[0].count);
}
