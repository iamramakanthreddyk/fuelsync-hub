"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalAnalytics = exports.getTenantSalesAnalytics = void 0;
const database_1 = __importDefault(require("../config/database"));
// Tenant sales analytics (for owner dashboard)
const getTenantSalesAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schemaName = req.schemaName;
    try {
        // Example: sales trend (last 30 days), total sales, avg sale, top products
        const trend = yield database_1.default.query(`
      SET search_path TO ${schemaName};
      SELECT date_trunc('day', created_at) AS day, SUM(amount) AS total
      FROM sales
      WHERE created_at > now() - interval '30 days'
      GROUP BY day ORDER BY day`);
        const total = yield database_1.default.query(`SELECT SUM(amount) AS total FROM sales`);
        const avg = yield database_1.default.query(`SELECT AVG(amount) AS avg FROM sales`);
        res.json({
            trend: trend.rows,
            total: total.rows[0].total,
            average: avg.rows[0].avg
        });
    }
    catch (err) {
        console.error('Sales analytics error:', err);
        res.status(500).json({ message: 'Failed to fetch sales analytics.' });
    }
});
exports.getTenantSalesAnalytics = getTenantSalesAnalytics;
// SuperAdmin global analytics (usage, limits, billing)
const getGlobalAnalytics = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Example: count tenants, users, stations, total sales
        const tenants = yield database_1.default.query('SELECT COUNT(*) FROM tenants');
        const users = yield database_1.default.query('SELECT COUNT(*) FROM public.users');
        const stations = yield database_1.default.query(`SELECT COUNT(*) FROM stations`);
        const sales = yield database_1.default.query('SELECT SUM(amount) FROM sales');
        res.json({
            tenants: tenants.rows[0].count,
            users: users.rows[0].count,
            stations: stations.rows[0].count,
            totalSales: sales.rows[0].sum
        });
    }
    catch (err) {
        console.error('Global analytics error:', err);
        res.status(500).json({ message: 'Failed to fetch global analytics.' });
    }
});
exports.getGlobalAnalytics = getGlobalAnalytics;
