/**
 * Simple Rate Limiter Utility
 * Basic rate limiting for API endpoints
 */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (id: string) => id,
      ...config
    };
  }

  isAllowed(identifier: string): RateLimitResult {
    const key = this.config.keyGenerator!(identifier);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this identifier
    let timestamps = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    timestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    // Check if under limit
    const allowed = timestamps.length < this.config.maxRequests;
    
    if (allowed) {
      // Add current request
      timestamps.push(now);
    }
    
    // Update storage
    this.requests.set(key, timestamps);
    
    // Calculate remaining requests
    const remaining = Math.max(0, this.config.maxRequests - timestamps.length);
    
    // Calculate reset time (when oldest request expires)
    const resetTime = timestamps.length > 0 
      ? Math.min(...timestamps) + this.config.windowMs 
      : now + this.config.windowMs;
    
    return {
      allowed,
      remaining,
      resetTime,
      totalRequests: timestamps.length
    };
  }

  reset(identifier: string): void {
    const key = this.config.keyGenerator!(identifier);
    this.requests.delete(key);
  }

  getStatus(identifier: string): RateLimitResult | null {
    const key = this.config.keyGenerator!(identifier);
    const timestamps = this.requests.get(key);
    
    if (!timestamps || timestamps.length === 0) {
      return null;
    }
    
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    const allowed = validTimestamps.length < this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - validTimestamps.length);
    const resetTime = validTimestamps.length > 0 
      ? Math.min(...validTimestamps) + this.config.windowMs 
      : now + this.config.windowMs;
    
    return {
      allowed,
      remaining,
      resetTime,
      totalRequests: validTimestamps.length
    };
  }

  cleanup(): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    let cleanedCount = 0;

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
      
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
        cleanedCount++;
      } else if (validTimestamps.length < timestamps.length) {
        this.requests.set(key, validTimestamps);
      }
    }

    return cleanedCount;
  }

  getStats(): {
    totalIdentifiers: number;
    totalRequests: number;
    averageRequestsPerIdentifier: number;
    mostActiveIdentifier: string | null;
  } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    let totalRequests = 0;
    let maxRequests = 0;
    let mostActiveIdentifier: string | null = null;

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
      totalRequests += validTimestamps.length;
      
      if (validTimestamps.length > maxRequests) {
        maxRequests = validTimestamps.length;
        mostActiveIdentifier = key;
      }
    }

    const totalIdentifiers = this.requests.size;
    const averageRequestsPerIdentifier = totalIdentifiers > 0 ? totalRequests / totalIdentifiers : 0;

    return {
      totalIdentifiers,
      totalRequests,
      averageRequestsPerIdentifier,
      mostActiveIdentifier
    };
  }

  clear(): void {
    this.requests.clear();
  }
}

// Predefined rate limiters
export const createApiRateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
  return new RateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (identifier: string) => `api:${identifier}`
  });
};

export const createAuthRateLimiter = (maxRequests: number = 5, windowMs: number = 900000) => {
  return new RateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (identifier: string) => `auth:${identifier}`
  });
};

export const createPasswordResetRateLimiter = (maxRequests: number = 3, windowMs: number = 3600000) => {
  return new RateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (identifier: string) => `password_reset:${identifier}`
  });
};

// Express middleware
export const rateLimitMiddleware = (rateLimiter: RateLimiter, identifierExtractor: (req: any) => string) => {
  return (req: any, res: any, next: any) => {
    try {
      const identifier = identifierExtractor(req);
      const result = rateLimiter.isAllowed(identifier);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': rateLimiter['config'].maxRequests,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });
      
      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          resetTime: result.resetTime
        });
      }
      
      next();
    } catch (error) {
      // If rate limiting fails, allow the request
      next();
    }
  };
};

// Default rate limiters
export const defaultApiLimiter = createApiRateLimiter();
export const defaultAuthLimiter = createAuthRateLimiter();
export const defaultPasswordResetLimiter = createPasswordResetRateLimiter();
