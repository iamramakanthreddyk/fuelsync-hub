// backend/src/middlewares/planLimits.ts
import { Request, Response, NextFunction } from 'express';
import { UserSession } from '../types/userSession';
import { PLAN_CONFIG, PLAN_TYPES, PlanType } from '../config/planConfig';
import { getStationCount, getPumpCount, getNozzleCount, hasPlanFeature } from '../services/plan.service';
import { sendError } from './error';

// Utility to get plan type safely
function getPlanType(user: UserSession): PlanType {
  if (user?.planType && PLAN_TYPES.includes(user.planType)) {
    return user.planType as PlanType;
  }
  return 'basic';
}

// Check if the user has exceeded their station limit
export const checkStationLimit = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as UserSession;
  // Skip for admins
  if (user?.isAdmin) {
    return next();
  }
  
  // Only check on POST to create new stations
  if (req.method !== 'POST') {
    return next();
  }
  
  try {
    const schemaName = req.schemaName as string;
    if (!schemaName) return sendError(res, 400, 'Schema name is required');
    const planType = getPlanType(user);
    const limits = PLAN_CONFIG[planType as PlanType];
    const stationCount = await getStationCount(schemaName);
    if (stationCount >= limits.maxStations) {
      return sendError(res, 403, `You have reached the maximum number of stations (${limits.maxStations}) allowed on your ${planType} plan.`, {
        limit: limits.maxStations,
        current: stationCount,
        planType
      });
    }
    next();
  } catch (error) {
    console.error('Error checking station limit:', error);
    next(error);
  }
};

// Check if the user has exceeded their pump limit for a station
export const checkPumpLimit = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as UserSession;
  // Skip for admins
  if (user?.isAdmin) {
    return next();
  }
  
  // Only check on POST to create new pumps
  if (req.method !== 'POST') {
    return next();
  }
  
  try {
    const schemaName = req.schemaName as string;
    if (!schemaName) return sendError(res, 400, 'Schema name is required');
    const planType = getPlanType(user);
    const { stationId } = req.body;
    if (!stationId) return sendError(res, 400, 'Station ID is required');
    const limits = PLAN_CONFIG[planType as PlanType];
    const pumpCount = await getPumpCount(schemaName, stationId as string);
    if (pumpCount >= limits.maxPumpsPerStation) {
      return sendError(res, 403, `You have reached the maximum number of pumps (${limits.maxPumpsPerStation}) per station allowed on your ${planType} plan.`, {
        limit: limits.maxPumpsPerStation,
        current: pumpCount,
        planType
      });
    }
    next();
  } catch (error) {
    console.error('Error checking pump limit:', error);
    next(error);
  }
};

// Check if the user has exceeded their nozzle limit for a pump
export const checkNozzleLimit = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as UserSession;
  // Skip for admins
  if (user?.isAdmin) {
    return next();
  }
  
  // Only check on POST to create new nozzles
  if (req.method !== 'POST') {
    return next();
  }
  
  try {
    const schemaName = req.schemaName as string;
    if (!schemaName) return sendError(res, 400, 'Schema name is required');
    const planType = getPlanType(user);
    const { pumpId } = req.body;
    if (!pumpId) return sendError(res, 400, 'Pump ID is required');
    const limits = PLAN_CONFIG[planType as PlanType];
    const nozzleCount = await getNozzleCount(schemaName, pumpId as string);
    if (nozzleCount >= limits.maxNozzlesPerPump) {
      return sendError(res, 403, `You have reached the maximum number of nozzles (${limits.maxNozzlesPerPump}) per pump allowed on your ${planType} plan.`, {
        limit: limits.maxNozzlesPerPump,
        current: nozzleCount,
        planType
      });
    }
    next();
  } catch (error) {
    console.error('Error checking nozzle limit:', error);
    next(error);
  }
};

// Generic plan feature enforcement middleware
export function checkPlanFeature(feature: keyof typeof PLAN_CONFIG['basic']) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserSession;
    if (!hasPlanFeature(user, feature)) {
      return sendError(res, 403, `Upgrade required for ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
    }
    next();
  };
}