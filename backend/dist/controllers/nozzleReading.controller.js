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
exports.submitNozzleReadings = exports.getCurrentFuelPrices = exports.getPreviousNozzleReadings = void 0;
const database_1 = __importDefault(require("../config/database"));
// Get previous day's readings for all nozzles at a station
const getPreviousNozzleReadings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stationId } = req.params;
    const schemaName = req.schemaName;
    try {
        const result = yield database_1.default.query(`SET search_path TO ${schemaName};
       SELECT n.id AS nozzle_id, n.name, n.fuel_type, r.reading AS previous_reading
       FROM nozzles n
       LEFT JOIN LATERAL (
         SELECT reading FROM nozzle_readings
         WHERE nozzle_id = n.id AND reading_date = (CURRENT_DATE - INTERVAL '1 day')
         ORDER BY reading_date DESC LIMIT 1
       ) r ON TRUE
       WHERE n.station_id = $1 AND n.active = true`, [stationId]);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch previous readings.' });
    }
});
exports.getPreviousNozzleReadings = getPreviousNozzleReadings;
// Get current fuel prices for all nozzles at a station
const getCurrentFuelPrices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stationId } = req.params;
    const schemaName = req.schemaName;
    try {
        const result = yield database_1.default.query(`SET search_path TO ${schemaName};
       SELECT n.id AS nozzle_id, n.fuel_type, p.price
       FROM nozzles n
       JOIN fuel_prices p ON p.fuel_type = n.fuel_type
       WHERE n.station_id = $1 AND n.active = true AND p.active = true
       ORDER BY n.fuel_type`, [stationId]);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch fuel prices.' });
    }
});
exports.getCurrentFuelPrices = getCurrentFuelPrices;
// Submit today's readings for all nozzles at a station
const submitNozzleReadings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { stationId } = req.params;
    const schemaName = req.schemaName;
    const { readings } = req.body; // [{ nozzleId, reading }]
    if (!Array.isArray(readings) || readings.length === 0) {
        return res.status(400).json({ message: 'No readings provided.' });
    }
    try {
        // Validate and insert readings, create sales records
        for (const { nozzleId, reading } of readings) {
            // Fetch previous reading
            const prevRes = yield database_1.default.query(`SET search_path TO ${schemaName};
         SELECT reading FROM nozzle_readings WHERE nozzle_id = $1 AND reading_date = (CURRENT_DATE - INTERVAL '1 day') LIMIT 1`, [nozzleId]);
            const prev = ((_a = prevRes.rows[0]) === null || _a === void 0 ? void 0 : _a.reading) || 0;
            if (reading < prev) {
                return res.status(400).json({ message: `Reading for nozzle ${nozzleId} is less than previous.` });
            }
            // Insert new reading
            yield database_1.default.query(`INSERT INTO nozzle_readings (nozzle_id, reading, reading_date) VALUES ($1, $2, CURRENT_DATE)`, [nozzleId, reading]);
            // Calculate volume sold and create sales record
            const volume = reading - prev;
            if (volume > 0) {
                // Get price
                const priceRes = yield database_1.default.query(`SELECT price FROM fuel_prices WHERE fuel_type = (SELECT fuel_type FROM nozzles WHERE id = $1) AND active = true LIMIT 1`, [nozzleId]);
                const price = ((_b = priceRes.rows[0]) === null || _b === void 0 ? void 0 : _b.price) || 0;
                yield database_1.default.query(`INSERT INTO sales (station_id, nozzle_id, volume, amount, sale_date)
           VALUES ($1, $2, $3, $4, CURRENT_DATE)`, [stationId, nozzleId, volume, volume * price]);
            }
        }
        res.json({ message: 'Readings submitted and sales recorded.' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to submit readings.' });
    }
});
exports.submitNozzleReadings = submitNozzleReadings;
