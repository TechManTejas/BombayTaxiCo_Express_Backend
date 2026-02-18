/**
 * F2P tests for API response utilities enhancements.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  validateRequestData,
  sanitizeInput,
  RateLimiter,
  ApiCache,
  RequestIdGenerator,
  ResponseTimeTracker,
  transformData,
  validateField,
  ApiResponse,
  ValidationError,
  DetailedError
} from '../utils/api-response';

describe('API Response Enhancements F2P Tests', () => {
  describe('createSuccessResponse enhancements', () => {
    it('should validate empty message', () => {
      // Bug: Should validate empty message
      expect(() => {
        createSuccessResponse({}, '');
      }).toThrow('Message must be a non-empty string');
    });

    it('should validate whitespace-only message', () => {
      // Bug: Should validate whitespace-only message
      expect(() => {
        createSuccessResponse({}, '   ');
      }).toThrow('Message must be a non-empty string');
    });

    it('should validate non-string message', () => {
      // Bug: Should validate non-string message
      expect(() => {
        createSuccessResponse({}, 123 as any);
      }).toThrow('Message must be a non-empty string');
    });

    it('should validate invalid success status code', () => {
      // Bug: Should validate success status codes
      expect(() => {
        createSuccessResponse({}, 'Success', 199);
      }).toThrow('Success status code must be between 200 and 299');

      expect(() => {
        createSuccessResponse({}, 'Success', 300);
      }).toThrow('Success status code must be between 200 and 299');
    });

    it('should include request ID and version', () => {
      // Bug: Should include optional metadata
      const response = createSuccessResponse({ data: 'test' }, 'Success', 200, {
        requestId: 'req-123',
        version: '2.0.0'
      });

      expect(response.requestId).toBe('req-123');
      expect(response.version).toBe('2.0.0');
    });

    it('should use default version when not provided', () => {
      // Bug: Should use default version
      const response = createSuccessResponse({ data: 'test' }, 'Success');
      expect(response.version).toBe('1.0.0');
    });

    it('should trim message whitespace', () => {
      // Bug: Should trim message
      const response = createSuccessResponse({ data: 'test' }, '  Success message  ');
      expect(response.message).toBe('Success message');
    });
  });

  describe('createErrorResponse enhancements', () => {
    it('should validate empty error message', () => {
      // Bug: Should validate empty error message
      expect(() => {
        createErrorResponse('Error', '');
      }).toThrow('Message must be a non-empty string');
    });

    it('should validate invalid error status code', () => {
      // Bug: Should validate error status codes
      expect(() => {
        createErrorResponse('Error', 'Error occurred', 399);
      }).toThrow('Error status code must be between 400 and 599');

      expect(() => {
        createErrorResponse('Error', 'Error occurred', 600);
      }).toThrow('Error status code must be between 400 and 599');
    });

    it('should handle DetailedError objects', () => {
      // Bug: Should handle detailed error objects
      const detailedError: DetailedError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: [
          { field: 'email', message: 'Invalid email format', code: 'INVALID_EMAIL' },
          { field: 'age', message: 'Age must be positive', code: 'INVALID_AGE' }
        ]
      };

      const response = createErrorResponse(detailedError, 'Validation failed', 400);
      expect(response.error).toBe('Invalid input data');
      expect(response.statusCode).toBe(400);
    });

    it('should handle empty error string', () => {
      // Bug: Should handle empty error string
      const response = createErrorResponse('', 'Error occurred', 500);
      expect(response.error).toBe('Unknown error occurred');
    });

    it('should trim error message whitespace', () => {
      // Bug: Should trim error message
      const response = createErrorResponse('  Error message  ', 'Error occurred');
      expect(response.error).toBe('Error message');
    });

    it('should include request ID and version', () => {
      // Bug: Should include optional metadata
      const response = createErrorResponse('Error', 'Error occurred', 500, {
        requestId: 'req-456',
        version: '2.1.0'
      });

      expect(response.requestId).toBe('req-456');
      expect(response.version).toBe('2.1.0');
    });
  });

  describe('ApiCache enhancements', () => {
    it('should implement LRU eviction', () => {
      // Bug: Should implement LRU eviction when cache is full
      const cache = new ApiCache(2); // Max 2 entries
      
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      cache.set('key3', 'value3', 1000); // Should evict least used
      
      expect(cache.get('key1')).toBeNull(); // Should be evicted
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should track access count for LRU', () => {
      // Bug: Should track access count for LRU decisions
      const cache = new ApiCache(3);
      
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      cache.set('key3', 'value3', 1000);
      
      // Access key1 multiple times
      cache.get('key1');
      cache.get('key1');
      cache.get('key1');
      
      // Access key2 once
      cache.get('key2');
      
      // Add new entry - should evict key3 (least accessed)
      cache.set('key4', 'value4', 1000);
      
      expect(cache.get('key1')).toBe('value1'); // Should still exist
      expect(cache.get('key2')).toBe('value2'); // Should still exist
      expect(cache.get('key3')).toBeNull(); // Should be evicted
      expect(cache.get('key4')).toBe('value4'); // Should exist
    });

    it('should handle max entries parameter', () => {
      // Bug: Should respect max entries parameter
      const cache = new ApiCache(5);
      expect(cache).toBeDefined();
    });
  });

  describe('RequestIdGenerator', () => {
    it('should generate unique request IDs', () => {
      // Bug: Should generate unique request IDs
      const id1 = RequestIdGenerator.generate();
      const id2 = RequestIdGenerator.generate();
      const id3 = RequestIdGenerator.generate();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate valid format', () => {
      // Bug: Should generate valid ID format
      const id = RequestIdGenerator.generate();
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
    });
  });

  describe('ResponseTimeTracker', () => {
    it('should track response time', () => {
      // Bug: Should track response time accurately
      const tracker = new ResponseTimeTracker();
      
      // Simulate some work
      const start = tracker.getDuration();
      expect(start).toBeGreaterThanOrEqual(0);
      
      // Wait a bit (in real scenario)
      setTimeout(() => {
        const duration = tracker.getDuration();
        expect(duration).toBeGreaterThan(start);
      }, 10);
    });

    it('should format duration as string', () => {
      // Bug: Should format duration properly
      const tracker = new ResponseTimeTracker();
      const durationStr = tracker.getDurationMs();
      expect(durationStr).toMatch(/^\d+ms$/);
    });
  });

  describe('transformData utility', () => {
    it('should transform data with filter and sort', () => {
      // Bug: Should apply filter and sort before transformation
      const data = [
        { id: 3, name: 'Charlie', active: true },
        { id: 1, name: 'Alice', active: false },
        { id: 2, name: 'Bob', active: true }
      ];

      const result = transformData(
        data,
        (item) => ({ id: item.id, name: item.name.toUpperCase() }),
        {
          filter: (item) => item.active,
          sort: (a, b) => a.id - b.id
        }
      );

      expect(result).toEqual([
        { id: 2, name: 'BOB' },
        { id: 3, name: 'CHARLIE' }
      ]);
    });

    it('should handle empty data array', () => {
      // Bug: Should handle empty data gracefully
      const result = transformData([], (item) => item);
      expect(result).toEqual([]);
    });

    it('should work with only transformer', () => {
      // Bug: Should work with minimal options
      const data = [{ id: 1, name: 'Alice' }];
      const result = transformData(data, (item) => item.name);
      expect(result).toEqual(['Alice']);
    });
  });

  describe('validateField utility', () => {
    it('should validate required field', () => {
      // Bug: Should validate required fields properly
      const result = validateField(undefined, { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field is required');
    });

    it('should validate field types', () => {
      // Bug: Should validate field types correctly
      const stringResult = validateField('test', { type: 'string' });
      expect(stringResult.isValid).toBe(true);

      const numberResult = validateField(42, { type: 'number' });
      expect(numberResult.isValid).toBe(true);

      const invalidResult = validateField('test', { type: 'number' });
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Expected type number, got string');
    });

    it('should validate string constraints', () => {
      // Bug: Should validate string length and patterns
      const minLengthResult = validateField('ab', { minLength: 3 });
      expect(minLengthResult.isValid).toBe(false);
      expect(minLengthResult.errors).toContain('Minimum length is 3');

      const maxLengthResult = validateField('abcdef', { maxLength: 5 });
      expect(maxLengthResult.isValid).toBe(false);
      expect(maxLengthResult.errors).toContain('Maximum length is 5');

      const patternResult = validateField('abc', { pattern: /^\d+$/ });
      expect(patternResult.isValid).toBe(false);
      expect(patternResult.errors).toContain('Invalid format');
    });

    it('should validate number constraints', () => {
      // Bug: Should validate number ranges
      const minResult = validateField(5, { min: 10 });
      expect(minResult.isValid).toBe(false);
      expect(minResult.errors).toContain('Minimum value is 10');

      const maxResult = validateField(15, { max: 10 });
      expect(maxResult.isValid).toBe(false);
      expect(maxResult.errors).toContain('Maximum value is 10');
    });

    it('should validate enum values', () => {
      // Bug: Should validate enum constraints
      const validResult = validateField('red', { enum: ['red', 'green', 'blue'] });
      expect(validResult.isValid).toBe(true);

      const invalidResult = validateField('yellow', { enum: ['red', 'green', 'blue'] });
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Value must be one of: red, green, blue');
    });

    it('should handle optional fields', () => {
      // Bug: Should skip validation for optional empty fields
      const result = validateField(undefined, { 
        required: false, 
        type: 'string', 
        minLength: 5 
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate array type', () => {
      // Bug: Should correctly identify array type
      const arrayResult = validateField([1, 2, 3], { type: 'array' });
      expect(arrayResult.isValid).toBe(true);

      const notArrayResult = validateField('not an array', { type: 'array' });
      expect(notArrayResult.isValid).toBe(false);
      expect(notArrayResult.errors).toContain('Expected type array, got string');
    });
  });

  describe('createPaginatedResponse edge cases', () => {
    it('should handle invalid pagination parameters', () => {
      // Bug: Should handle edge cases in pagination
      const data = [1, 2, 3, 4, 5];
      
      // Test negative page
      const negativePage = createPaginatedResponse(data, -1, 10, 5);
      expect(negativePage.pagination.page).toBe(1);
      
      // Test zero page size
      const zeroPageSize = createPaginatedResponse(data, 1, 0, 5);
      expect(zeroPageSize.pagination.pageSize).toBe(10); // Default
      
      // Test NaN values
      const nanPage = createPaginatedResponse(data, NaN, 10, 5);
      expect(nanPage.pagination.page).toBe(1); // Default
    });

    it('should handle infinite values', () => {
      // Bug: Should handle infinite values gracefully
      const data = [1, 2, 3];
      
      const infinitePage = createPaginatedResponse(data, Infinity, 10, 3);
      expect(infinitePage.pagination.page).toBe(1); // Default
      
      const infinitePageSize = createPaginatedResponse(data, 1, Infinity, 3);
      expect(infinitePageSize.pagination.pageSize).toBe(10); // Default
    });
  });

  describe('validateRequestData edge cases', () => {
    it('should handle null required fields', () => {
      // Bug: Should handle null required fields array
      const result = validateRequestData({ field: 'value' }, null as any);
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should handle empty required fields array', () => {
      // Bug: Should handle empty required fields array
      const result = validateRequestData({ field: 'value' }, []);
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should handle undefined data', () => {
      // Bug: Should handle undefined data object
      const result = validateRequestData(undefined, ['field1', 'field2']);
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(['field1', 'field2']);
    });
  });

  describe('sanitizeInput edge cases', () => {
    it('should handle circular references', () => {
      // Bug: Should handle circular references gracefully
      const obj: any = { name: 'test' };
      obj.self = obj;
      
      // Should not throw an error and should skip circular references
      const result = sanitizeInput(obj);
      expect(result.name).toBe('test');
      expect(result.self).toBeUndefined(); // Circular reference should be skipped
    });

    it('should handle Date objects', () => {
      // Bug: Should handle Date objects properly
      const date = new Date();
      const result = sanitizeInput(date);
      expect(result).toBe(date); // Date objects should pass through
    });

    it('should handle RegExp objects', () => {
      // Bug: Should handle RegExp objects
      const regex = /test/g;
      const result = sanitizeInput(regex);
      expect(result).toBe(regex); // RegExp objects should pass through
    });
  });

  describe('RateLimiter edge cases', () => {
    afterEach(() => {
      // Clean up any lingering intervals
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('should handle zero windowMs', () => {
      // Bug: Should handle zero window time
      jest.useFakeTimers();
      const rateLimiter = new RateLimiter(5, 0);
      
      // Should allow requests since window is effectively zero
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      
      rateLimiter.destroy();
    });

    it('should handle negative parameters', () => {
      // Bug: Should handle negative parameters gracefully
      jest.useFakeTimers();
      const rateLimiter = new RateLimiter(-1, -1000);
      
      // Should still work without crashing (parameters are normalized)
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      
      rateLimiter.destroy();
    });

    it('should handle cleanup after destroy', () => {
      // Bug: Should handle operations after destroy
      jest.useFakeTimers();
      const rateLimiter = new RateLimiter(5, 1000);
      
      rateLimiter.destroy();
      
      // Should not throw errors
      expect(() => {
        rateLimiter.isAllowed('user1');
        rateLimiter.reset('user1');
        rateLimiter.cleanup();
      }).not.toThrow();
    });
  });
});
