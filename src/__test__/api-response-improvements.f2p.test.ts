/**
 * F2P tests for API response utility improvements.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  sanitizeInput,
  RateLimiter,
  ApiCache
} from '../utils/api-response';

describe('API Response Improvements F2P Tests', () => {
  describe('Response status codes', () => {
    it('should include status code in success response', () => {
      // Bug: Should include status code in response
      const response = createSuccessResponse({ test: 'data' }, 'Success', 201);
      
      expect(response.statusCode).toBe(201);
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ test: 'data' });
    });
    
    it('should use default status code 200 for success', () => {
      // Bug: Should have default status code
      const response = createSuccessResponse({ test: 'data' });
      
      expect(response.statusCode).toBe(200);
    });
    
    it('should include status code in error response', () => {
      // Bug: Should include status code in error response
      const response = createErrorResponse('Error message', 'Failed', 400);
      
      expect(response.statusCode).toBe(400);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Error message');
    });
    
    it('should use default status code 500 for errors', () => {
      // Bug: Should have default error status code
      const response = createErrorResponse('Error message');
      
      expect(response.statusCode).toBe(500);
    });
  });
  
  describe('Pagination improvements', () => {
    it('should handle zero total correctly', () => {
      // Bug: Should handle zero total without division issues
      const response = createPaginatedResponse([], 1, 10, 0);
      
      expect(response.pagination.total).toBe(0);
      expect(response.pagination.totalPages).toBe(0);
      expect(response.pagination.hasNext).toBe(false);
      expect(response.pagination.hasPrev).toBe(false);
    });
    
    it('should handle negative total gracefully', () => {
      // Bug: Should handle negative total values
      const response = createPaginatedResponse([], 1, 10, -5);
      
      expect(response.pagination.total).toBe(0);
      expect(response.pagination.totalPages).toBe(0);
    });
    
    it('should handle zero page size safely', () => {
      // Bug: Should handle zero page size without division by zero
      const response = createPaginatedResponse([], 1, 0, 100);
      
      expect(response.pagination.pageSize).toBe(10); // Should use default
      expect(response.pagination.totalPages).toBe(10);
    });
  });
  
  describe('Input sanitization improvements', () => {
    it('should handle null input gracefully', () => {
      // Bug: Should handle null input without errors
      const result = sanitizeInput(null);
      
      expect(result).toBe(null);
    });
    
    it('should handle undefined input gracefully', () => {
      // Bug: Should handle undefined input without errors
      const result = sanitizeInput(undefined);
      
      expect(result).toBe(undefined);
    });
    
    it('should sanitize nested objects with null values', () => {
      // Bug: Should handle null values in nested objects
      const input = {
        name: 'test',
        value: null,
        nested: {
          prop: 'value',
          nullProp: null
        }
      };
      
      const result = sanitizeInput(input);
      
      expect(result.name).toBe('test');
      expect(result.value).toBe(null);
      expect(result.nested.prop).toBe('value');
      expect(result.nested.nullProp).toBe(null);
    });
  });
  
  describe('Rate limiter improvements', () => {
    let rateLimiter: RateLimiter;
    
    beforeEach(() => {
      rateLimiter = new RateLimiter(5, 1000); // 5 requests per second
    });
    
    afterEach(() => {
      rateLimiter.destroy();
    });
    
    it('should cleanup expired entries automatically', () => {
      // Bug: Should cleanup expired entries to prevent memory leaks
      const identifier = 'test-user';
      
      // Make requests to fill the limiter
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed(identifier)).toBe(true);
      }
      
      // Should be blocked now
      expect(rateLimiter.isAllowed(identifier)).toBe(false);
      
      // Manually trigger cleanup
      rateLimiter.cleanup();
      
      // Wait for window to expire (simulate with time travel)
      const now = Date.now();
      const requests = (rateLimiter as any).requests.get(identifier) || [];
      
      // Manually expire all requests
      for (let i = 0; i < requests.length; i++) {
        requests[i] = now - 2000; // 2 seconds ago
      }
      
      rateLimiter.cleanup();
      
      // Should be allowed again after cleanup
      expect(rateLimiter.isAllowed(identifier)).toBe(true);
    });
    
    it('should handle cleanup without memory leaks', () => {
      // Bug: Should properly cleanup interval on destroy
      const rateLimiter2 = new RateLimiter(10, 1000);
      
      // Add some requests
      for (let i = 0; i < 3; i++) {
        rateLimiter2.isAllowed(`user-${i}`);
      }
      
      // Should not throw error on destroy
      expect(() => rateLimiter2.destroy()).not.toThrow();
    });
  });
  
  describe('Cache improvements', () => {
    let cache: ApiCache;
    
    beforeEach(() => {
      cache = new ApiCache();
    });
    
    it('should handle invalid TTL values', () => {
      // Bug: Should handle invalid TTL values gracefully
      expect(() => cache.set('key', 'value', 0)).not.toThrow();
      expect(() => cache.set('key', 'value', -1)).not.toThrow();
      expect(() => cache.set('key', 'value', NaN)).not.toThrow();
      expect(() => cache.set('key', 'value', Infinity)).not.toThrow();
    });
    
    it('should count only non-expired items', () => {
      // Bug: Should count only valid cache entries
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1); // Will expire immediately
      
      // Wait for expiration
      setTimeout(() => {
        expect(cache.size()).toBe(1);
      }, 10);
      
      expect(cache.size()).toBe(2); // Before expiration
    });
  });
});
