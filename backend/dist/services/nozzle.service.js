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
exports.recordNozzleReading = exports.updateNozzle = exports.getNozzleById = exports.getNozzlesByStationId = exports.getNozzlesByPumpId = exports.createNozzle = void 0;
const db_service_1 = require("./db.service");
const createNozzle = (schemaName, pumpId, fuelType, initialReading) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_service_1.insertWithUUID)(schemaName, 'nozzles', {
        pump_id: pumpId,
        fuel_type: fuelType,
        initial_reading: initialReading,
        current_reading: initialReading
    }, 'id, pump_id, fuel_type, initial_reading, current_reading, active, created_at');
});
exports.createNozzle = createNozzle;
const getNozzlesByPumpId = (schemaName, pumpId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT n.id, n.pump_id, n.fuel_type, n.initial_reading, n.current_reading, n.active, n.created_at, n.updated_at,
           p.name as pump_name
    FROM nozzles n
    JOIN pumps p ON n.pump_id = p.id
    WHERE n.pump_id = $1
    ORDER BY n.fuel_type`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [pumpId]);
    return result.rows;
});
exports.getNozzlesByPumpId = getNozzlesByPumpId;
const getNozzlesByStationId = (schemaName, stationId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT n.id, n.pump_id, n.fuel_type, n.initial_reading, n.current_reading, n.active, n.created_at, n.updated_at,
           p.name as pump_name
    FROM nozzles n
    JOIN pumps p ON n.pump_id = p.id
    WHERE p.station_id = $1 AND n.active = true
    ORDER BY p.name, n.fuel_type`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [stationId]);
    return result.rows;
});
exports.getNozzlesByStationId = getNozzlesByStationId;
const getNozzleById = (schemaName, nozzleId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT n.id, n.pump_id, n.fuel_type, n.initial_reading, n.current_reading, n.active, n.created_at, n.updated_at,
           p.name as pump_name
    FROM nozzles n
    JOIN pumps p ON n.pump_id = p.id
    WHERE n.id = $1`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [nozzleId]);
    return result.rows.length > 0 ? result.rows[0] : null;
});
exports.getNozzleById = getNozzleById;
const updateNozzle = (schemaName, nozzleId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const setClause = Object.keys(updates)
        .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
        .join(', ');
    const values = Object.values(updates);
    const query = `
    UPDATE nozzles
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1
    RETURNING id, pump_id, fuel_type, initial_reading, current_reading, active, created_at, updated_at`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [nozzleId, ...values]);
    return result.rows.length > 0 ? result.rows[0] : null;
});
exports.updateNozzle = updateNozzle;
const recordNozzleReading = (schemaName, nozzleId, reading, recordedBy, notes) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_service_1.withTransaction)(schemaName, (client) => __awaiter(void 0, void 0, void 0, function* () {
        yield client.query(`UPDATE nozzles SET current_reading = $1, updated_at = NOW() WHERE id = $2`, [reading, nozzleId]);
        const result = yield client.query(`INSERT INTO nozzle_readings (nozzle_id, reading, recorded_by, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nozzle_id, reading, recorded_at, recorded_by, notes`, [nozzleId, reading, recordedBy, notes]);
        return result.rows[0];
    }));
});
exports.recordNozzleReading = recordNozzleReading;
