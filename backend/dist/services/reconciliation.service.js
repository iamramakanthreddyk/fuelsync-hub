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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailySalesTotals = exports.getReconciliationById = exports.getReconciliations = exports.createReconciliation = void 0;
const db_service_1 = require("./db.service");
const createReconciliation = (schemaName, stationId, date, totalSales, cashTotal, creditTotal, cardTotal, upiTotal, finalized, createdBy, notes) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_service_1.withTransaction)(schemaName, (client) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if reconciliation already exists
        const existingResult = yield client.query(`SELECT id FROM day_reconciliations WHERE station_id = $1 AND date = $2`, [stationId, date]);
        let reconciliationId;
        if (existingResult.rows.length > 0) {
            reconciliationId = existingResult.rows[0].id;
            yield client.query(`UPDATE day_reconciliations
         SET total_sales = $1, cash_total = $2, credit_total = $3, card_total = $4, upi_total = $5,
             finalized = $6, notes = $7, updated_at = NOW()
         WHERE id = $8`, [totalSales, cashTotal, creditTotal, cardTotal, upiTotal, finalized, notes, reconciliationId]);
        }
        else {
            const result = yield client.query(`INSERT INTO day_reconciliations (
           station_id, date, total_sales, cash_total, credit_total, card_total, upi_total, 
           finalized, created_by, notes
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`, [stationId, date, totalSales, cashTotal, creditTotal, cardTotal, upiTotal,
                finalized, createdBy, notes]);
            reconciliationId = result.rows[0].id;
        }
        if (finalized) {
            yield client.query(`UPDATE sales
         SET status = 'posted'
         WHERE station_id = $1 
         AND DATE(recorded_at) = $2
         AND status = 'draft'`, [stationId, date]);
        }
        const reconciliationResult = yield client.query(`SELECT dr.*, s.name as station_name, 
         u.first_name || ' ' || u.last_name as created_by_name
       FROM day_reconciliations dr
       JOIN stations s ON dr.station_id = s.id
       JOIN users u ON dr.created_by = u.id
       WHERE dr.id = $1`, [reconciliationId]);
        return reconciliationResult.rows[0];
    }));
});
exports.createReconciliation = createReconciliation;
const getReconciliations = (schemaName, stationId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    let query = `
    SELECT dr.*, s.name as station_name, 
      u.first_name || ' ' || u.last_name as created_by_name
    FROM day_reconciliations dr
    JOIN stations s ON dr.station_id = s.id
    JOIN users u ON dr.created_by = u.id
    WHERE 1=1`;
    const params = [];
    let paramIndex = 1;
    if (stationId) {
        query += ` AND dr.station_id = $${paramIndex++}`;
        params.push(stationId);
    }
    if (startDate) {
        query += ` AND dr.date >= $${paramIndex++}`;
        params.push(startDate);
    }
    if (endDate) {
        query += ` AND dr.date <= $${paramIndex++}`;
        params.push(endDate);
    }
    query += ` ORDER BY dr.date DESC, s.name`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, params);
    return result.rows;
});
exports.getReconciliations = getReconciliations;
const getReconciliationById = (schemaName, reconciliationId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT dr.*, s.name as station_name, 
           u.first_name || ' ' || u.last_name as created_by_name
    FROM day_reconciliations dr
    JOIN stations s ON dr.station_id = s.id
    JOIN users u ON dr.created_by = u.id
    WHERE dr.id = $1`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [reconciliationId]);
    return result.rows.length > 0 ? result.rows[0] : null;
});
exports.getReconciliationById = getReconciliationById;
const getDailySalesTotals = (schemaName, stationId, date) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT 
       COALESCE(SUM(amount), 0) as total_sales,
       COALESCE(SUM(cash_received), 0) as cash_total,
       COALESCE(SUM(credit_given), 0) as credit_total
     FROM sales
     WHERE station_id = $1 
       AND DATE(recorded_at) = $2
       AND status != 'voided'`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [stationId, date]);
    return result.rows[0];
});
exports.getDailySalesTotals = getDailySalesTotals;
