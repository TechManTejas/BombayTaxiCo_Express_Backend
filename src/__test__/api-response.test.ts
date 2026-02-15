import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  asyncHandler,
  validateRequestData,
  sanitizeInput,
  RateLimiter,
  ApiCache
} from '../utils/api-response';

describe('API Response Utilities', () => {
  describe('createSuccessResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data, 'Success message');
      
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success message');
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
    });

    it('should use default message', () => {
      const response = createSuccessResponse({ test: true });
      
      expect(response.message).toBe('Operation completed successfully');
    });

    it('should include timestamp', () => {
      const response = createSuccessResponse({});
      
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response', () => {
      const response = createErrorResponse('Something went wrong', 'Error message');
      
      expect(response.success).toBe(false);
      expect(response.message).toBe('Error message');
      expect(response.error).toBe('Something went wrong');
      expect(response.timestamp).toBeDefined();
    });

    it('should use default message', () => {
      const response = createErrorResponse('Error');
      
      expect(response.message).toBe('Operation failed');
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create a paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createPaginatedResponse(data, 1, 10, 25);
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.pageSize).toBe(10);
      expect(response.pagination.total).toBe(25);
      expect(response.pagination.totalPages).toBe(3);
      expect(response.pagination.hasNext).toBe(true);
      expect(response.pagination.hasPrev).toBe(false);
    });

    it('should handle last page correctly', () => {
      const data = [{ id: 1 }];
      const response = createPaginatedResponse(data, 3, 10, 25);
      
      expect(response.pagination.hasNext).toBe(false);
      expect(response.pagination.hasPrev).toBe(true);
    });

    it('should handle single page correctly', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createPaginatedResponse(data, 1, 10, 2);
      
      expect(response.pagination.totalPages).toBe(1);
      expect(response.pagination.hasNext).toBe(false);
      expect(response.pagination.hasPrev).toBe(false);
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async function', async () => {
      const asyncFn = async (value: string) => Promise.resolve(value.toUpperCase());
      const wrappedFn = asyncHandler(asyncFn);
      
      const result = await wrappedFn('hello');
      expect(result).toBe('HELLO');
    });

    it('should handle async function error', async () => {
      const asyncFn = async () => Promise.reject(new Error('Test error'));
      const wrappedFn = asyncHandler(asyncFn);
      
      await expect(wrappedFn()).rejects.toThrow('Test error');
    });

    it('should handle non-Error objects', async () => {
      const asyncFn = async () => Promise.reject('String error');
      const wrappedFn = asyncHandler(asyncFn);
      
      await expect(wrappedFn()).rejects.toThrow('An unexpected error occurred');
    });
  });

  describe('validateRequestData', () => {
    it('should validate required fields correctly', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const result = validateRequestData(data, ['name', 'email']);
      
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });

    it('should identify missing required fields', () => {
      const data = { name: 'John' };
      const result = validateRequestData(data, ['name', 'email']);
      
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(['email']);
    });

    it('should handle empty data', () => {
      const result = validateRequestData(null, ['name']);
      
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(['name']);
    });

    it('should handle empty strings as missing', () => {
      const data = { name: '', email: 'test@example.com' };
      const result = validateRequestData(data, ['name', 'email']);
      
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(['name']);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize string input', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeInput(input);
      
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should trim string input', () => {
      const input = '  hello world  ';
      const result = sanitizeInput(input);
      
      expect(result).toBe('hello world');
    });

    it('should sanitize array input', () => {
      const input = ['<script>', 'normal', '<div>'];
      const result = sanitizeInput(input);
      
      expect(result).toEqual(['&lt;script&gt;', 'normal', '&lt;div&gt;']);
    });

    it('should sanitize object input', () => {
      const input = { name: '<script>', safe: 'normal' };
      const result = sanitizeInput(input);
      
      expect(result).toEqual({ name: '&lt;script&gt;', safe: 'normal' });
    });

    it('should return primitive values unchanged', () => {
      expect(sanitizeInput(42)).toBe(42);
      expect(sanitizeInput(true)).toBe(true);
      expect(sanitizeInput(null)).toBe(null);
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed('user1')).toBe(true);
      }
      
      // 6th request should be blocked
      expect(rateLimiter.isAllowed('user1')).toBe(false);
    });

    it('should handle different users separately', () => {
      // User1 makes 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.isAllowed('user1');
      }
      
      // User1 should be blocked
      expect(rateLimiter.isAllowed('user1')).toBe(false);
      
      // User2 should still be allowed
      expect(rateLimiter.isAllowed('user2')).toBe(true);
    });

    it('should reset specific user', () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.isAllowed('user1');
      }
      
      // Should be blocked
      expect(rateLimiter.isAllowed('user1')).toBe(false);
      
      // Reset user
      rateLimiter.reset('user1');
      
      // Should be allowed again
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });
  });

  describe('ApiCache', () => {
    let cache: ApiCache;

    beforeEach(() => {
      cache = new ApiCache();
    });

    it('should store and retrieve data', () => {
      cache.set('key1', 'value1', 60000);
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should handle expired keys', (done) => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      
      setTimeout(() => {
        expect(cache.get('key1')).toBeNull();
        done();
      }, 150);
    });

    it('should delete specific key', () => {
      cache.set('key1', 'value1', 60000);
      cache.set('key2', 'value2', 60000);
      
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should return false when deleting non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should clear all keys', () => {
      cache.set('key1', 'value1', 60000);
      cache.set('key2', 'value2', 60000);
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should return correct size', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1', 60000);
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 'value2', 60000);
      expect(cache.size()).toBe(2);
      
      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });
  });
});
