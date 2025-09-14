import "dotenv/config";
import express from "express";
// import compression from "compression";
import { UserService } from "./services/user.service";
import authRoutes from "./routes/auth.routes";
import { logger } from "./utils/logger";
import { redisClient } from "./config/redis";
import { initializeDatabase } from "./config/database";
import { securityMiddleware } from "./middleware/security.middleware";
import { requestLogger } from "./middleware/requestLogger";
import { createApiResponse } from "./utils/response";
// import { generalRateLimit } from "./middleware/auth.middleware";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { userRouter } from "./routes/user.routes";


const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || "v1";

// Initialize services
const userService = new UserService();

async function startServer(): Promise<void> {
  try {
    // Connect to Redis
    await redisClient.connect();

    // Initialize database
    await initializeDatabase();

    // Initialize default roles
    await userService.initializeDefaultRoles();

    // Security middleware
    app.use(securityMiddleware);

    // Basic middleware
    // app.use(compression());
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    app.use(requestLogger);

    // Rate limiting
    // app.use(generalRateLimit);

    // Health check endpoint
    app.get("/health", (_req, res) => {
      res.status(200).json(
        createApiResponse(true, {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: API_VERSION,
        })
      );
    });

    // API routes
    app.use(`/api/${API_VERSION}/auth`, authRoutes);
    app.use(`/api/user`, userRouter);

    // 404 handler
    app.use(notFoundHandler);

    // Error handler (must be last)
    app.use(errorHandler);

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API version: ${API_VERSION}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Received SIGINT, shutting down gracefully...");

      try {
        await redisClient.quit();
        logger.info("Redis connection closed");
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start the server
startServer();
