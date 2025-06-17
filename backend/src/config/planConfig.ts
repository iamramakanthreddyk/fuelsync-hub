// backend/src/config/planConfig.ts
// Centralized plan configuration for limits and features

export const PLAN_TYPES = ['basic', 'premium', 'enterprise'] as const;
export type PlanType = typeof PLAN_TYPES[number];

export type PlanConfig = {
  maxStations: number;
  maxPumpsPerStation: number;
  maxNozzlesPerPump: number;
  maxUsers: number;
  exportData: boolean;
  advancedReports: boolean;
  apiAccess: boolean;
  manageStations: boolean;
  managePumps: boolean;
  manageNozzles: boolean;
  managePrices: boolean;
  manageUsers: boolean;
  recordSales: boolean;
  reconcile: boolean;
  viewReports: boolean;
};

export const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
  basic: {
    maxStations: 1,
    maxPumpsPerStation: 4,
    maxNozzlesPerPump: 4,
    maxUsers: 5,
    exportData: false,
    advancedReports: false,
    apiAccess: false,
    manageStations: true,
    managePumps: true,
    manageNozzles: true,
    managePrices: true,
    manageUsers: false,
    recordSales: true,
    reconcile: true,
    viewReports: true,
  },
  premium: {
    maxStations: 5,
    maxPumpsPerStation: 8,
    maxNozzlesPerPump: 6,
    maxUsers: 20,
    exportData: true,
    advancedReports: true,
    apiAccess: false,
    manageStations: true,
    managePumps: true,
    manageNozzles: true,
    managePrices: true,
    manageUsers: true,
    recordSales: true,
    reconcile: true,
    viewReports: true,
  },
  enterprise: {
    maxStations: 999,
    maxPumpsPerStation: 999,
    maxNozzlesPerPump: 999,
    maxUsers: 999,
    exportData: true,
    advancedReports: true,
    apiAccess: true,
    manageStations: true,
    managePumps: true,
    manageNozzles: true,
    managePrices: true,
    manageUsers: true,
    recordSales: true,
    reconcile: true,
    viewReports: true,
  },
};
