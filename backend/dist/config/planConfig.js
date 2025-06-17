"use strict";
// backend/src/config/planConfig.ts
// Centralized plan configuration for limits and features
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_CONFIG = exports.PLAN_TYPES = void 0;
exports.PLAN_TYPES = ['basic', 'premium', 'enterprise'];
exports.PLAN_CONFIG = {
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
