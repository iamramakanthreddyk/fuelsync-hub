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
exports.getCachedData = getCachedData;
// src/utils/cache.ts
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default('process.env.REDIS_URL');
/**
 * Cache wrapper: attempts to return cached data or fetch & cache it.
 *
 * @param key Redis cache key
 * @param fetchFn Function to fetch data if not cached
 * @param ttl Time to live in seconds (default: 3600s = 1 hour)
 * @returns Cached or freshly fetched data
 */
function getCachedData(key_1, fetchFn_1) {
    return __awaiter(this, arguments, void 0, function* (key, fetchFn, ttl = 3600) {
        const cached = yield redis.get(key);
        if (cached)
            return JSON.parse(cached);
        const data = yield fetchFn();
        yield redis.set(key, JSON.stringify(data), 'EX', ttl);
        return data;
    });
}
