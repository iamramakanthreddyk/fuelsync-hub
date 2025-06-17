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
exports.getDashboardData = void 0;
const database_1 = __importDefault(require("../config/database"));
// Owner/Manager dashboard KPIs and trends
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const schemaName = req.schemaName;
    const { stationId } = req.query;
    try {
        // Today's fuel prices
        const prices = yield database_1.default.query(`SET search_path TO ${schemaName};
       SELECT fuel_type, price FROM fuel_prices WHERE station_id = $1 AND active = true ORDER BY fuel_type`, [stationId]);
        // Today's sales summary
        const sales = yield database_1.default.query(`SELECT SUM(amount) AS total_amount, SUM(volume) AS total_volume
       FROM sales WHERE station_id = $1 AND sale_date = CURRENT_DATE`, [stationId]);
        // 7-day sales trend
        const trend = yield database_1.default.query(`SELECT sale_date, SUM(amount) AS total_amount
       FROM sales WHERE station_id = $1 AND sale_date >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY sale_date ORDER BY sale_date`, [stationId]);
        // Payment breakdown
        const payments = yield database_1.default.query(`SELECT payment_method, SUM(amount) AS total
       FROM sales WHERE station_id = $1 AND sale_date = CURRENT_DATE
       GROUP BY payment_method`, [stationId]);
        // Top 3 creditors and aging
        const creditors = yield database_1.default.query(`SELECT customer_name, SUM(amount) AS outstanding, MAX(sale_date) AS last_sale
       FROM sales WHERE station_id = $1 AND payment_method = 'credit' AND paid = false
       GROUP BY customer_name ORDER BY outstanding DESC LIMIT 3`, [stationId]);
        const totalCredit = yield database_1.default.query(`SELECT SUM(amount) AS total_outstanding
       FROM sales WHERE station_id = $1 AND payment_method = 'credit' AND paid = false`, [stationId]);
        res.json({
            prices: prices.rows,
            sales: sales.rows[0],
            trend: trend.rows,
            payments: payments.rows,
            creditors: creditors.rows,
            totalCredit: ((_a = totalCredit.rows[0]) === null || _a === void 0 ? void 0 : _a.total_outstanding) || 0
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch dashboard data.' });
    }
});
exports.getDashboardData = getDashboardData;
