"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD
});
exports.redisClient = redisClient;
redisClient.on('error', (err) => {
    logger_1.logger.error('Redis Client Error:', err);
});
redisClient.on('connect', () => {
    logger_1.logger.info('Connected to Redis');
});
//# sourceMappingURL=redis.js.map