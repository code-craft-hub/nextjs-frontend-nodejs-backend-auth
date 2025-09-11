"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const user_service_1 = require("./services/user.service");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const logger_1 = require("./utils/logger");
const redis_1 = require("./config/redis");
const database_1 = require("./config/database");
const security_middleware_1 = require("./middleware/security.middleware");
const requestLogger_1 = require("./middleware/requestLogger");
const response_1 = require("./utils/response");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || "v1";
const userService = new user_service_1.UserService();
async function startServer() {
    try {
        await redis_1.redisClient.connect();
        await (0, database_1.initializeDatabase)();
        await userService.initializeDefaultRoles();
        app.use(security_middleware_1.securityMiddleware);
        app.use((0, compression_1.default)());
        app.use(express_1.default.json({ limit: "10mb" }));
        app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
        app.use(requestLogger_1.requestLogger);
        app.use(generalRateLimit);
        app.get("/health", (req, res) => {
            res.status(200).json((0, response_1.createApiResponse)(true, {
                status: "healthy",
                timestamp: new Date().toISOString(),
                version: API_VERSION,
            }));
        });
        app.use(`/api/${API_VERSION}/auth`, auth_routes_1.default);
        app.use(notFoundHandler);
        app.use(errorHandler);
        app.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
            logger_1.logger.info(`API version: ${API_VERSION}`);
            logger_1.logger.info(`Environment: ${process.env.NODE_ENV}`);
        });
        process.on("SIGINT", async () => {
            logger_1.logger.info("Received SIGINT, shutting down gracefully...");
            try {
                await redis_1.redisClient.quit();
                logger_1.logger.info("Redis connection closed");
                process.exit(0);
            }
            catch (error) {
                logger_1.logger.error("Error during shutdown:", error);
                process.exit(1);
            }
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to start server:", error);
        process.exit(1);
    }
}
process.on("unhandledRejection", (reason, promise) => {
    logger_1.logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    logger_1.logger.error("Uncaught Exception:", error);
    process.exit(1);
});
startServer();
//# sourceMappingURL=index.js.map