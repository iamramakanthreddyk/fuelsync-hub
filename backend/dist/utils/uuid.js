"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = generateUUID;
const crypto_1 = require("crypto");
/**
 * Generates a UUID (v4) using Node.js crypto module.
 * Optionally accepts a prefix for domain-specific ID formats.
 *
 * @param prefix Optional prefix for namespacing or debugging (e.g., "user", "station")
 * @returns A UUID string, optionally prefixed (e.g., "station_f47ac10b-58cc-4372-a567-0e02b2c3d479")
 */
function generateUUID(prefix) {
    const uuid = (0, crypto_1.randomUUID)();
    return prefix ? `${prefix}_${uuid}` : uuid;
}
