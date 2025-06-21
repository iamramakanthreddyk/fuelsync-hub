// backend/src/controllers/plan.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';
import { PLAN_CONFIG, PlanType, PlanConfig } from '../config/planConfig';
import { sendErrorResponse } from '../utils/errorResponse';

// Get all plans (for SuperAdmin UI)
export const getAllPlans = (_req: Request, res: Response) => {
  res.json(PLAN_CONFIG);
};

// Get a tenant's plan (including custom override)
export const getTenantPlan = async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  try {
    const result = await pool.query('SELECT custom_plan FROM tenants WHERE id = $1', [tenantId]);
    if (result.rows.length && result.rows[0].custom_plan) {
      return res.json(result.rows[0].custom_plan);
    }
    // Fallback: return standard plan
    const planType = result.rows.length ? result.rows[0].subscription_plan : 'basic';
    res.json(PLAN_CONFIG[planType as PlanType]);
  } catch (err) {
    sendErrorResponse(res, 'SERVER_ERROR', 'Failed to fetch tenant plan.', 500);
  }
};

// Set a custom plan for a tenant (SuperAdmin only)
export const setCustomPlan = async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  const customPlan: PlanConfig = req.body;
  try {
    await pool.query('UPDATE tenants SET custom_plan = $1 WHERE id = $2', [customPlan, tenantId]);
    res.json({ message: 'Custom plan set successfully.' });
  } catch (err) {
    sendErrorResponse(res, 'SERVER_ERROR', 'Failed to set custom plan.', 500);
  }
};

// Remove a custom plan (revert to standard)
export const removeCustomPlan = async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  try {
    await pool.query('UPDATE tenants SET custom_plan = NULL WHERE id = $1', [tenantId]);
    res.json({ message: 'Custom plan removed.' });
  } catch (err) {
    sendErrorResponse(res, 'SERVER_ERROR', 'Failed to remove custom plan.', 500);
  }
};
