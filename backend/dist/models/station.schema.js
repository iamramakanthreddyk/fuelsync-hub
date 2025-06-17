"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createStationSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    address: joi_1.default.string().allow('').max(255),
    city: joi_1.default.string().allow('').max(100),
    state: joi_1.default.string().allow('').max(100),
    zip: joi_1.default.string().allow('').max(20),
    contactPhone: joi_1.default.string().allow('').max(30),
    location: joi_1.default.object().optional(),
    operatingHours: joi_1.default.object().optional()
});
