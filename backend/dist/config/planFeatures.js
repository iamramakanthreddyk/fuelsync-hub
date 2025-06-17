"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_FEATURES = void 0;
exports.PLAN_FEATURES = {
    basic: {
        manageStations: true,
        managePumps: true,
        manageNozzles: true,
        managePrices: true,
        manageUsers: false,
        recordSales: true,
        reconcile: true,
        exportData: false,
        viewReports: true,
    },
    premium: {
        manageStations: true,
        managePumps: true,
        manageNozzles: true,
        managePrices: true,
        manageUsers: true,
        recordSales: true,
        reconcile: true,
        exportData: true,
        viewReports: true,
    },
    enterprise: {
        manageStations: true,
        managePumps: true,
        manageNozzles: true,
        managePrices: true,
        manageUsers: true,
        recordSales: true,
        reconcile: true,
        exportData: true,
        viewReports: true,
    },
};
