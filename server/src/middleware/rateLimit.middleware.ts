import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger";
import { createApiResponse } from "../utils/response";

export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) =>
  rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: createApiResponse(false, null, {
      code: "RATE_LIMIT_EXCEEDED",
      message: options.message || "Too many requests, please try again later",
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json(
        createApiResponse(false, null, {
          code: "RATE_LIMIT_EXCEEDED",
          message: options.message || "Too many requests, please try again later",
        })
      );
    },
  });

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later",
});

export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
