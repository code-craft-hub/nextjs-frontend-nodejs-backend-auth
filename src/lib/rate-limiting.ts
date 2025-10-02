interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimit>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; remaining: number } {
  const now = Date.now();
  const limit = rateLimits.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (limit.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  limit.count++;
  return { success: true, remaining: maxRequests - limit.count };
}