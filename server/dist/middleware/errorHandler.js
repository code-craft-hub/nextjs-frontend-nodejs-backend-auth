"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const errorHandler = (error, req, res, _next) => {
    logger_1.logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message;
    res.status(500).json((0, response_1.createApiResponse)(false, null, {
        code: 'INTERNAL_SERVER_ERROR',
        message
    }));
};
exports.errorHandler = errorHandler;
const notFoundHandler = (_req, res) => {
    res.status(404).json((0, response_1.createApiResponse)(false, null, {
        code: 'NOT_FOUND',
        message: 'Route not found'
    }));
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map