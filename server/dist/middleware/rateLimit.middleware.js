"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalRateLimit = exports.authRateLimit = exports.createRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const createRateLimiter = (options) => (0, express_rate_limit_1.default)({
    windowMs: options.windowMs,
    max: options.max,
    message: (0, response_1.createApiResponse)(false, null, {
        code: "RATE_LIMIT_EXCEEDED",
        message: options.message || "Too many requests, please try again later",
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_1.logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json((0, response_1.createApiResponse)(false, null, {
            code: "RATE_LIMIT_EXCEEDED",
            message: options.message || "Too many requests, please try again later",
        }));
    },
});
exports.createRateLimiter = createRateLimiter;
exports.authRateLimit = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many authentication attempts, please try again later",
});
exports.generalRateLimit = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later",
});
//# sourceMappingURL=rateLimit.middleware.js.map