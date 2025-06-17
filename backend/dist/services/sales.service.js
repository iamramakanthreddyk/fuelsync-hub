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
exports.voidSale = exports.getSales = exports.createSale = void 0;
exports.getDailySalesTotals = getDailySalesTotals;
// src/services/sales.service.ts
const database_1 = __importDefault(require("../config/database"));
const createSale = (schemaName, stationId, nozzleId, userId, cumulativeReading, saleVolume, cashReceived, creditGiven, creditPartyId, notes) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield database_1.default.connect();
    try {
        yield client.query('BEGIN');
        // Set search path to tenant schema
        yield client.query(`SET search_path TO ${schemaName}`);
        // Get previous reading
        const previousReadingResult = yield client.query(`SELECT current_reading FROM nozzles WHERE id = $1`, [nozzleId]);
        if (previousReadingResult.rows.length === 0) {
            throw new Error('Nozzle not found');
        }
        const previousReading = parseFloat(previousReadingResult.rows[0].current_reading);
        // Calculate sale volume if not provided
        const calculatedSaleVolume = saleVolume || (cumulativeReading - previousReading);
        if (calculatedSaleVolume <= 0) {
            throw new Error('Sale volume must be positive');
        }
        // Get current fuel price
        const fuelPriceResult = yield client.query(`SELECT fp.price_per_unit, n.fuel_type
       FROM nozzles n
       JOIN fuel_prices fp ON n.fuel_type = fp.fuel_type AND fp.station_id = $1
       WHERE n.id = $2
       AND fp.effective_from <= NOW()
       AND (fp.effective_to IS NULL OR fp.effective_to > NOW())
       ORDER BY fp.effective_from DESC
       LIMIT 1`, [stationId, nozzleId]);
        if (fuelPriceResult.rows.length === 0) {
            throw new Error('No active fuel price found for this nozzle');
        }
        const fuelPrice = parseFloat(fuelPriceResult.rows[0].price_per_unit);
        // Calculate amount
        const amount = calculatedSaleVolume * fuelPrice;
        // Validate payment amounts
        if (Math.abs((cashReceived + creditGiven) - amount) > 0.01) {
            throw new Error('Cash received plus credit given must equal the total amount');
        }
        // Determine payment method
        let paymentMethod = 'cash';
        if (creditGiven > 0 && cashReceived > 0) {
            paymentMethod = 'mixed';
        }
        else if (creditGiven > 0) {
            paymentMethod = 'credit';
        }
        // Insert sale record
        const saleResult = yield client.query(`INSERT INTO sales (
        station_id, nozzle_id, user_id, sale_volume, cumulative_reading, 
        previous_reading, fuel_price, amount, cash_received, credit_given,
        payment_method, credit_party_id, status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`, [
            stationId, nozzleId, userId, calculatedSaleVolume, cumulativeReading,
            previousReading, fuelPrice, amount, cashReceived, creditGiven,
            paymentMethod, creditPartyId, 'posted', notes
        ]);
        // Update nozzle current reading
        yield client.query(`UPDATE nozzles SET current_reading = $1 WHERE id = $2`, [cumulativeReading, nozzleId]);
        // Record nozzle reading history
        yield client.query(`INSERT INTO nozzle_readings (nozzle_id, reading, recorded_by)
       VALUES ($1, $2, $3)`, [nozzleId, cumulativeReading, userId]);
        // If credit given, update creditor
        if (creditGiven > 0 && creditPartyId) {
            yield client.query(`UPDATE creditors
         SET running_balance = running_balance + $1, last_updated_at = NOW()
         WHERE id = $2`, [creditGiven, creditPartyId]);
        }
        yield client.query('COMMIT');
        return saleResult.rows[0];
    }
    catch (error) {
        yield client.query('ROLLBACK');
        console.error('Error creating sale:', error);
        throw error;
    }
    finally {
        client.release();
    }
});
exports.createSale = createSale;
const getSales = (schemaName, stationId, startDate, endDate, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield database_1.default.connect();
    try {
        // Set search path to tenant schema
        yield client.query(`SET search_path TO ${schemaName}`);
        let query = `
      SELECT s.*, 
        u.first_name || ' ' || u.last_name as employee_name,
        n.fuel_type,
        p.name as pump_name,
        st.name as station_name,
        c.party_name as creditor_name
      FROM sales s
      JOIN users u ON s.user_id = u.id
      JOIN nozzles n ON s.nozzle_id = n.id
      JOIN pumps p ON n.pump_id = p.id
      JOIN stations st ON s.station_id = st.id
      LEFT JOIN creditors c ON s.credit_party_id = c.id
      WHERE 1=1
    `;
        const params = [];
        let paramIndex = 1;
        if (stationId) {
            query += ` AND s.station_id = $${paramIndex++}`;
            params.push(stationId);
        }
        if (startDate) {
            query += ` AND s.recorded_at >= $${paramIndex++}`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND s.recorded_at <= $${paramIndex++}`;
            params.push(endDate);
        }
        if (userId) {
            query += ` AND s.user_id = $${paramIndex++}`;
            params.push(userId);
        }
        query += ` ORDER BY s.recorded_at DESC`;
        const result = yield client.query(query, params);
        return result.rows;
    }
    catch (error) {
        console.error('Error getting sales:', error);
        throw error;
    }
    finally {
        client.release();
    }
});
exports.getSales = getSales;
function getDailySalesTotals(schemaName, arg1, arg2) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.default.connect();
        try {
            // Set search path to tenant schema
            yield client.query(`SET search_path TO ${schemaName}`);
            const query = `
      SELECT 
        DATE(recorded_at) as sale_date,
        SUM(amount) as total_amount,
        SUM(sale_volume) as total_volume,
        COUNT(*) as total_sales
      FROM sales
      WHERE station_id = $1 AND DATE(recorded_at) = $2
      GROUP BY sale_date
      ORDER BY sale_date DESC
    `;
            return client.query(query, [arg1, arg2]);
        }
        catch (error) {
            console.error('Error getting daily sales totals:', error);
            throw error;
        }
        finally {
            client.release();
        }
    });
}
const voidSale = (schemaName, saleId, userId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield database_1.default.connect();
    try {
        yield client.query('BEGIN');
        // Set search path to tenant schema
        yield client.query(`SET search_path TO ${schemaName}`);
        // Get sale details
        const saleResult = yield client.query(`SELECT * FROM sales WHERE id = $1 AND status = 'posted'`, [saleId]);
        if (saleResult.rows.length === 0) {
            throw new Error('Sale not found or already voided');
        }
        const sale = saleResult.rows[0];
        // Update sale status to voided
        yield client.query(`UPDATE sales SET status = 'voided', voided_by = $1, voided_at = NOW(), void_reason = $2
       WHERE id = $3`, [userId, reason, saleId]);
        // If credit was given, update creditor balance
        if (sale.credit_given > 0 && sale.credit_party_id) {
            yield client.query(`UPDATE creditors
         SET running_balance = running_balance - $1, last_updated_at = NOW()
         WHERE id = $2`, [sale.credit_given, sale.credit_party_id]);
        }
        yield client.query('COMMIT');
        return { message: 'Sale voided successfully' };
    }
    catch (error) {
        yield client.query('ROLLBACK');
        console.error('Error voiding sale:', error);
        throw error;
    }
    finally {
        client.release();
    }
});
exports.voidSale = voidSale;
