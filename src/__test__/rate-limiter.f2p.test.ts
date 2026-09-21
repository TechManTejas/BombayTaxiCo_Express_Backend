/**
 * F2P tests for rate limiter utility.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { 
  RateLimiter, 
  RateLimitConfig,
  RateLimitResult,
  createApiRateLimiter,
  createAuthRateLimiter,
  createPasswordResetRateLimiter,
  rateLimitMiddleware,
  defaultApiLimiter,
  defaultAuthLimiter,
  defaultPasswordResetLimiter
} from '../utils/rate-limiter';

describe('Rate Limiter F2P Tests', () => {
  let rateLimiter: RateLimiter;
  let testConfig: RateLimitConfig;

  beforeEach(() => {
    testConfig = {
      windowMs: 1000, // 1 second
      maxRequests: 3
    };
    rateLimiter = new RateLimiter(testConfig);
  });

  describe('RateLimiter class', () => {
    it('should create rate limiter with default config', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter).toBeInstanceOf(RateLimiter);
    });

    it('should allow requests within limit', () => {
      const result1 = rateLimiter.isAllowed('user1');
      const result2 = rateLimiter.isAllowed('user1');
      const result3 = rateLimiter.isAllowed('user1');
      
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding limit', () => {
      // Use up the limit
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      
      // Should be blocked
      const result = rateLimiter.isAllowed('user1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.totalRequests).toBe(3);
    });

    it('should handle different identifiers separately', () => {
      // Use up limit for user1
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      
      // user1 should be blocked
      const user1Result = rateLimiter.isAllowed('user1');
      expect(user1Result.allowed).toBe(false);
      
      // user2 should still be allowed
      const user2Result = rateLimiter.isAllowed('user2');
      expect(user2Result.allowed).toBe(true);
    });

    it('should reset after window expires', async () => {
      // Use up the limit
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      
      // Should be blocked
      let result = rateLimiter.isAllowed('user1');
      expect(result.allowed).toBe(false);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be allowed again
      result = rateLimiter.isAllowed('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should use custom key generator', () => {
      const customConfig = {
        ...testConfig,
        keyGenerator: (id: string) => `prefix:${id}`
      };
      const customLimiter = new RateLimiter(customConfig);
      
      customLimiter.isAllowed('user1');
      const status = customLimiter.getStatus('user1');
      
      expect(status).not.toBeNull();
      expect(status!.totalRequests).toBe(1);
    });

    it('should reset specific identifier', () => {
      // Use up limit for user1
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      
      // Reset user1
      rateLimiter.reset('user1');
      
      // user1 should be allowed again
      const result = rateLimiter.isAllowed('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should get status for identifier', () => {
      // Make some requests
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      
      const status = rateLimiter.getStatus('user1');
      expect(status).not.toBeNull();
      expect(status!.allowed).toBe(true);
      expect(status!.remaining).toBe(1);
      expect(status!.totalRequests).toBe(2);
      
      // Non-existent identifier should return null
      const nonExistentStatus = rateLimiter.getStatus('nonexistent');
      expect(nonExistentStatus).toBeNull();
    });

    it('should cleanup expired entries', async () => {
      // Make requests for multiple users
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user2');
      rateLimiter.isAllowed('user3');
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Cleanup should remove expired entries
      const cleanedCount = rateLimiter.cleanup();
      expect(cleanedCount).toBe(3);
      
      // Status should return null for all users
      expect(rateLimiter.getStatus('user1')).toBeNull();
      expect(rateLimiter.getStatus('user2')).toBeNull();
      expect(rateLimiter.getStatus('user3')).toBeNull();
    });

    it('should provide accurate statistics', () => {
      // Make requests for multiple users
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user2');
      rateLimiter.isAllowed('user3');
      
      const stats = rateLimiter.getStats();
      expect(stats.totalIdentifiers).toBe(3);
      expect(stats.totalRequests).toBe(4);
      expect(stats.averageRequestsPerIdentifier).toBeCloseTo(1.33, 2);
      expect(stats.mostActiveIdentifier).toBe('user1');
    });

    it('should clear all entries', () => {
      // Make requests for multiple users
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user2');
      rateLimiter.isAllowed('user3');
      
      // Clear all
      rateLimiter.clear();
      
      // All statuses should be null
      expect(rateLimiter.getStatus('user1')).toBeNull();
      expect(rateLimiter.getStatus('user2')).toBeNull();
      expect(rateLimiter.getStatus('user3')).toBeNull();
      
      const stats = rateLimiter.getStats();
      expect(stats.totalIdentifiers).toBe(0);
      expect(stats.totalRequests).toBe(0);
    });

    it('should calculate reset time correctly', () => {
      const startTime = Date.now();
      
      // Make a request
      const result = rateLimiter.isAllowed('user1');
      
      // Reset time should be within the window
      expect(result.resetTime).toBeGreaterThanOrEqual(startTime + testConfig.windowMs - 100);
      expect(result.resetTime).toBeLessThanOrEqual(startTime + testConfig.windowMs + 100);
    });

    it('should handle rapid requests correctly', () => {
      const results = [];
      
      // Make rapid requests
      for (let i = 0; i < 10; i++) {
        results.push(rateLimiter.isAllowed('user1'));
      }
      
      // First 3 should be allowed
      expect(results[0].allowed).toBe(true);
      expect(results[1].allowed).toBe(true);
      expect(results[2].allowed).toBe(true);
      
      // Rest should be blocked
      for (let i = 3; i < 10; i++) {
        expect(results[i].allowed).toBe(false);
      }
    });
  });

  describe('Predefined rate limiters', () => {
    it('should create API rate limiter', () => {
      const limiter = createApiRateLimiter(100, 60000);
      expect(limiter).toBeInstanceOf(RateLimiter);
      
      // Test with custom config
      const customLimiter = createApiRateLimiter(50, 30000);
      const result = customLimiter.isAllowed('test');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(49);
    });

    it('should create auth rate limiter', () => {
      const limiter = createAuthRateLimiter(5, 900000);
      expect(limiter).toBeInstanceOf(RateLimiter);
      
      const result = limiter.isAllowed('test');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should create password reset rate limiter', () => {
      const limiter = createPasswordResetRateLimiter(3, 3600000);
      expect(limiter).toBeInstanceOf(RateLimiter);
      
      const result = limiter.isAllowed('test');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should use default limiters', () => {
      expect(defaultApiLimiter).toBeInstanceOf(RateLimiter);
      expect(defaultAuthLimiter).toBeInstanceOf(RateLimiter);
      expect(defaultPasswordResetLimiter).toBeInstanceOf(RateLimiter);
      
      const apiResult = defaultApiLimiter.isAllowed('test');
      const authResult = defaultAuthLimiter.isAllowed('test');
      const passwordResult = defaultPasswordResetLimiter.isAllowed('test');
      
      expect(apiResult.allowed).toBe(true);
      expect(authResult.allowed).toBe(true);
      expect(passwordResult.allowed).toBe(true);
    });
  });

  describe('Express middleware', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      mockReq = {
        ip: '127.0.0.1',
        headers: {},
        method: 'GET',
        url: '/api/test'
      };
      
      mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      mockNext = jest.fn();
    });

    it('should allow requests within limit', () => {
      const middleware = rateLimitMiddleware(
        rateLimiter,
        (req) => req.ip
      );
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.set).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        testConfig.maxRequests
      );
      expect(mockRes.set).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        expect.any(Number)
      );
      expect(mockRes.set).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(String)
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should block requests exceeding limit', () => {
      // Use up the limit
      rateLimiter.isAllowed('127.0.0.1');
      rateLimiter.isAllowed('127.0.0.1');
      rateLimiter.isAllowed('127.0.0.1');
      
      const middleware = rateLimitMiddleware(
        rateLimiter,
        (req) => req.ip
      );
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        resetTime: expect.any(Number)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      const middleware = rateLimitMiddleware(
        rateLimiter,
        () => {
          throw new Error('Extractor error');
        }
      );
      
      middleware(mockReq, mockRes, mockNext);
      
      // Should allow request when rate limiting fails
      expect(mockNext).toHaveBeenCalled();
    });

    it('should work with custom identifier extractor', () => {
      const middleware = rateLimitMiddleware(
        rateLimiter,
        (req) => req.headers['x-user-id'] || 'anonymous'
      );
      
      mockReq.headers['x-user-id'] = 'user123';
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty identifier', () => {
      const result = rateLimiter.isAllowed('');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should handle null/undefined identifier', () => {
      const result1 = rateLimiter.isAllowed(null as any);
      const result2 = rateLimiter.isAllowed(undefined as any);
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });

    it('should handle very long identifiers', () => {
      const longId = 'a'.repeat(1000);
      const result = rateLimiter.isAllowed(longId);
      expect(result.allowed).toBe(true);
    });

    it('should handle special characters in identifiers', () => {
      const specialId = 'user@domain.com/path?param=value';
      const result = rateLimiter.isAllowed(specialId);
      expect(result.allowed).toBe(true);
    });

    it('should handle zero max requests', () => {
      const zeroConfig = { windowMs: 1000, maxRequests: 0 };
      const zeroLimiter = new RateLimiter(zeroConfig);
      
      const result = zeroLimiter.isAllowed('user1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle very small window', async () => {
      const smallConfig = { windowMs: 10, maxRequests: 2 };
      const smallLimiter = new RateLimiter(smallConfig);
      
      // Make requests
      smallLimiter.isAllowed('user1');
      smallLimiter.isAllowed('user1');
      
      // Should be blocked
      let result = smallLimiter.isAllowed('user1');
      expect(result.allowed).toBe(false);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Should be allowed again
      result = smallLimiter.isAllowed('user1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Performance and scalability', () => {
    it('should handle high volume of requests', () => {
      const startTime = Date.now();
      
      // Make many requests for different users
      for (let i = 0; i < 1000; i++) {
        rateLimiter.isAllowed(`user${i}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
      
      const stats = rateLimiter.getStats();
      expect(stats.totalIdentifiers).toBe(1000);
      expect(stats.totalRequests).toBe(1000);
    });

    it('should handle concurrent requests simulation', () => {
      const promises = [];
      
      // Simulate concurrent requests
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(rateLimiter.isAllowed(`user${i % 10}`)));
      }
      
      return Promise.all(promises).then(results => {
        expect(results).toHaveLength(100);
        results.forEach(result => {
          expect(result).toHaveProperty('allowed');
          expect(result).toHaveProperty('remaining');
          expect(result).toHaveProperty('resetTime');
          expect(result).toHaveProperty('totalRequests');
        });
      });
    });

    it('should maintain performance with many identifiers', () => {
      // Create many identifiers with requests
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 3; j++) {
          rateLimiter.isAllowed(`user${i}`);
        }
      }
      
      const startTime = Date.now();
      const stats = rateLimiter.getStats();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Stats should be fast
      expect(stats.totalIdentifiers).toBe(100);
      expect(stats.totalRequests).toBe(300);
    });
  });

  describe('Integration scenarios', () => {
    it('should work in real-world API scenario', () => {
      const apiLimiter = createApiRateLimiter(60, 60000); // 60 requests per minute
      const authLimiter = createAuthRateLimiter(5, 900000); // 5 requests per 15 minutes
      
      // Simulate API requests
      for (let i = 0; i < 10; i++) {
        const apiResult = apiLimiter.isAllowed('user1');
        expect(apiResult.allowed).toBe(true);
        expect(apiResult.remaining).toBe(60 - i - 1);
      }
      
      // Simulate auth attempts
      for (let i = 0; i < 5; i++) {
        const authResult = authLimiter.isAllowed('user1');
        expect(authResult.allowed).toBe(true);
        expect(authResult.remaining).toBe(5 - i - 1);
      }
      
      // Should be blocked for auth
      const authBlocked = authLimiter.isAllowed('user1');
      expect(authBlocked.allowed).toBe(false);
      
      // But API should still work
      const apiResult = apiLimiter.isAllowed('user1');
      expect(apiResult.allowed).toBe(true);
    });

    it('should handle mixed request patterns', async () => {
      const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 5 });
      
      // Simulate burst pattern
      for (let i = 0; i < 3; i++) {
        limiter.isAllowed('user1');
      }
      
      let status = limiter.getStatus('user1');
      expect(status!.remaining).toBe(2);
      
      // Wait and make more requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
      for (let i = 0; i < 3; i++) {
        limiter.isAllowed('user1');
      }
      
      status = limiter.getStatus('user1');
      expect(status!.allowed).toBe(false);
      expect(status!.totalRequests).toBe(5);
    });
  });
});
