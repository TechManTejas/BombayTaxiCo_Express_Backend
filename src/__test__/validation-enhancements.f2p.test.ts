/**
 * F2P tests for validation enhancements.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  validateData,
  validateObject,
  sanitizeString,
  sanitizeObject,
  validateWithContext,
  validateBatch,
  createValidationError,
  formatValidationErrors,
  getValidationStats,
  ValidationRule,
  ValidationContext,
  ValidationConfig,
  ValidationResult
} from '../utils/validation';

describe('Validation Enhancements F2P Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Enhanced Validation Rules', () => {
    it('should validate email type correctly', () => {
      // Bug: Should validate email type correctly
      const rules: ValidationRule[] = [
        {
          field: 'email',
          type: 'email',
          required: true
        }
      ];

      const validData = { email: 'test@example.com' };
      const result = validateData(validData, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject invalid email format', () => {
      // Bug: Should reject invalid email format
      const rules: ValidationRule[] = [
        {
          field: 'email',
          type: 'email',
          required: true
        }
      ];

      const invalidData = { email: 'invalid-email' };
      const result = validateData(invalidData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('email must be a valid email address');
    });

    it('should validate URL type correctly', () => {
      // Bug: Should validate URL type correctly
      const rules: ValidationRule[] = [
        {
          field: 'website',
          type: 'url',
          required: false
        }
      ];

      const validData = { website: 'https://example.com' };
      const result = validateData(validData, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject invalid URL format', () => {
      // Bug: Should reject invalid URL format
      const rules: ValidationRule[] = [
        {
          field: 'website',
          type: 'url',
          required: false
        }
      ];

      const invalidData = { website: 'not-a-url' };
      const result = validateData(invalidData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.website).toContain('website must be a valid URL');
    });

    it('should validate phone type with warnings', () => {
      // Bug: Should validate phone type with warnings
      const rules: ValidationRule[] = [
        {
          field: 'phone',
          type: 'phone',
          required: false
        }
      ];

      const suspiciousData = { phone: 'abc123' };
      const result = validateData(suspiciousData, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings.phone).toContain('phone may not be a valid phone number');
    });

    it('should validate date type correctly', () => {
      // Bug: Should validate date type correctly
      const rules: ValidationRule[] = [
        {
          field: 'birthdate',
          type: 'date',
          required: true
        }
      ];

      const validData = { birthdate: '2023-01-01' };
      const result = validateData(validData, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject invalid date format', () => {
      // Bug: Should reject invalid date format
      const rules: ValidationRule[] = [
        {
          field: 'birthdate',
          type: 'date',
          required: true
        }
      ];

      const invalidData = { birthdate: 'not-a-date' };
      const result = validateData(invalidData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.birthdate).toContain('birthdate must be a valid date');
    });

    it('should check for finite numbers', () => {
      // Bug: Should check for finite numbers
      const rules: ValidationRule[] = [
        {
          field: 'amount',
          type: 'number',
          required: true
        }
      ];

      const nanData = { amount: NaN };
      const result = validateData(nanData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toContain('amount must be a finite number');
    });

    it('should validate Infinity as invalid', () => {
      // Bug: Should validate Infinity as invalid
      const rules: ValidationRule[] = [
        {
          field: 'score',
          type: 'number',
          required: true
        }
      ];

      const infinityData = { score: Infinity };
      const result = validateData(infinityData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.score).toContain('score must be a finite number');
    });
  });

  describe('Array Validation', () => {
    it('should validate array items with nested rules', () => {
      // Bug: Should validate array items with nested rules
      const rules: ValidationRule[] = [
        {
          field: 'users',
          type: 'array',
          required: true,
          items: [
            {
              field: 'name',
              type: 'string',
              required: true,
              minLength: 2
            }
          ]
        }
      ];

      const validData = {
        users: [
          { name: 'John' },
          { name: 'Jane' }
        ]
      };

      const result = validateData(validData, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject invalid array items', () => {
      // Bug: Should reject invalid array items
      const rules: ValidationRule[] = [
        {
          field: 'users',
          type: 'array',
          required: true,
          items: [
            {
              field: 'name',
              type: 'string',
              required: true,
              minLength: 2
            }
          ]
        }
      ];

      const invalidData = {
        users: [
          { name: 'A' }, // Too short
          { name: '' }  // Empty
        ]
      };

      const result = validateData(invalidData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.users).toBeDefined();
      expect(result.errors.users[0]).toContain('users[0]');
      expect(result.errors.users[1]).toContain('users[1]');
    });
  });

  describe('Object Validation', () => {
    it('should validate object properties', () => {
      // Bug: Should validate object properties
      const rules: ValidationRule[] = [
        {
          field: 'address',
          type: 'object',
          required: true,
          properties: {
            street: {
              field: 'street',
              type: 'string',
              required: true
            },
            city: {
              field: 'city',
              type: 'string',
              required: true
            }
          }
        }
      ];

      const validData = {
        address: {
          street: '123 Main St',
          city: 'New York'
        }
      };

      const result = validateData(validData, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate required object keys', () => {
      // Bug: Should validate required object keys
      const rules: ValidationRule[] = [
        {
          field: 'person',
          type: 'object',
          required: true,
          requiredKeys: ['name', 'age']
        }
      ];

      const invalidData = {
        person: {
          name: 'John'
          // Missing 'age'
        }
      };

      const result = validateData(invalidData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.person).toContain('person missing required keys: age');
    });
  });

  describe('Conditional Validation', () => {
    it('should apply conditional validation', () => {
      // Bug: Should apply conditional validation
      const rules: ValidationRule[] = [
        {
          field: 'confirmPassword',
          type: 'string',
          required: false,
          conditional: (value, allData) => allData.password && allData.password.length > 0,
          custom: (value, allData) => value === allData.password || 'Passwords must match'
        }
      ];

      const validData = {
        password: 'secret123',
        confirmPassword: 'secret123'
      };

      const result = validateData(validData, rules, { enableConditionalValidation: true });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should skip validation when condition is false', () => {
      // Bug: Should skip validation when condition is false
      const rules: ValidationRule[] = [
        {
          field: 'confirmPassword',
          type: 'string',
          required: false,
          conditional: (value, allData) => allData.password && allData.password.length > 0,
          custom: (value, allData) => value === allData.password || 'Passwords must match'
        }
      ];

      const dataWithoutPassword = {
        confirmPassword: 'anything'
      };

      const result = validateData(dataWithoutPassword, rules, { enableConditionalValidation: true });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('Transform Validation', () => {
    it('should transform values before validation', () => {
      // Bug: Should transform values before validation
      const rules: ValidationRule[] = [
        {
          field: 'email',
          type: 'string',
          required: true,
          transform: (value) => value.toLowerCase().trim(),
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
      ];

      const data = {
        email: '  TEST@EXAMPLE.COM  '
      };

      const result = validateData(data, rules, { enableTransform: true });

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.email).toBe('test@example.com');
    });

    it('should handle transform errors gracefully', () => {
      // Bug: Should handle transform errors gracefully
      const rules: ValidationRule[] = [
        {
          field: 'age',
          type: 'number',
          required: true,
          transform: (value) => {
            if (value === 'invalid') {
              throw new Error('Invalid age value');
            }
            return parseInt(value);
          }
        }
      ];

      const data = {
        age: 'invalid'
      };

      const result = validateData(data, rules, { enableTransform: true });

      expect(result.isValid).toBe(false);
      expect(result.errors.age).toContain('Failed to transform age: Invalid age value');
    });
  });

  describe('Sanitization', () => {
    it('should sanitize string inputs', () => {
      // Bug: Should sanitize string inputs
      const rules: ValidationRule[] = [
        {
          field: 'comment',
          type: 'string',
          required: true,
          sanitize: true
        }
      ];

      const maliciousData = {
        comment: '<script>alert("xss")</script>Hello World'
      };

      const result = validateData(maliciousData, rules, { enableSanitization: true });

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.comment).toBe('&lt;/script&gt;alert("xss")Hello World');
    });

    it('should sanitize nested objects', () => {
      // Bug: Should sanitize nested objects
      const data = {
        user: {
          name: '<script>alert("xss")</script>John',
          bio: '<iframe src="evil.com"></iframe>About me'
        }
      };

      const sanitized = sanitizeObject(data);

      expect(sanitized.user.name).toBe('&lt;/script&gt;alert("xss")John');
      expect(sanitized.user.bio).toBe('&lt;iframe&gt; src="evil.com"&gt;About me');
    });

    it('should sanitize arrays', () => {
      // Bug: Should sanitize arrays
      const data = {
        tags: ['<script>alert("xss")</script>tag1', 'tag2']
      };

      const sanitized = sanitizeObject(data);

      expect(sanitized.tags[0]).toBe('&lt;/script&gt;alert("xss")tag1');
      expect(sanitized.tags[1]).toBe('tag2');
    });
  });

  describe('Contextual Validation', () => {
    it('should validate with context', () => {
      // Bug: Should validate with context
      const rules: ValidationRule[] = [
        {
          field: 'email',
          type: 'email',
          required: true
        }
      ];

      const context: ValidationContext = {
        requestId: 'req-123',
        userId: 'user-456',
        timestamp: new Date().toISOString(),
        userAgent: 'TestAgent/1.0',
        ip: '192.168.1.1'
      };

      const data = { email: 'test@example.com' };
      const result = validateWithContext(data, rules, context);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData).toBeDefined();
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple datasets', () => {
      // Bug: Should validate multiple datasets
      const rules: ValidationRule[] = [
        {
          field: 'name',
          type: 'string',
          required: true,
          minLength: 2
        }
      ];

      const datasets = [
        {
          data: { name: 'John' },
          rules
        },
        {
          data: { name: 'Jane' },
          rules
        },
        {
          data: { name: 'A' }, // Too short
          rules
        }
      ];

      const results = validateBatch(datasets);

      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);
    });
  });

  describe('Error Creation and Formatting', () => {
    it('should create validation errors with details', () => {
      // Bug: Should create validation errors with details
      const error = createValidationError(
        'email',
        'INVALID_FORMAT',
        'Email format is invalid',
        'invalid-email',
        'user.email',
        'error'
      );

      expect(error.code).toBe('INVALID_FORMAT');
      expect(error.message).toBe('Email format is invalid');
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid-email');
      expect(error.path).toBe('user.email');
      expect(error.severity).toBe('error');
    });

    it('should format validation errors for API responses', () => {
      // Bug: Should format validation errors for API responses
      const errors = {
        email: ['Email is required', 'Email format is invalid'],
        name: ['Name is too short']
      };

      const formatted = formatValidationErrors(errors);

      expect(formatted.email).toEqual(['Email is required', 'Email format is invalid']);
      expect(formatted.name).toEqual(['Name is too short']);
    });
  });

  describe('Validation Statistics', () => {
    it('should calculate validation statistics', () => {
      // Bug: Should calculate validation statistics
      const results: ValidationResult[] = [
        { isValid: true, errors: {}, warnings: {} },
        { isValid: false, errors: { email: ['Invalid'] }, warnings: {} },
        { isValid: false, errors: { name: ['Required'] }, warnings: {} },
        { isValid: true, errors: {}, warnings: {} }
      ];

      const stats = getValidationStats(results);

      expect(stats.total).toBe(4);
      expect(stats.passed).toBe(2);
      expect(stats.failed).toBe(2);
      expect(stats.errorRate).toBe(50);
      expect(stats.commonErrors.email).toBe(1);
      expect(stats.commonErrors.name).toBe(1);
    });
  });

  describe('Strict Mode', () => {
    it('should treat custom validation as errors in strict mode', () => {
      // Bug: Should treat custom validation as errors in strict mode
      const rules: ValidationRule[] = [
        {
          field: 'password',
          type: 'string',
          required: true,
          custom: (value) => value.length >= 8 || 'Password must be at least 8 characters'
        }
      ];

      const data = { password: 'short' };
      const result = validateData(data, rules, { strictMode: true });

      expect(result.isValid).toBe(false);
      expect(result.errors.password).toContain('Password must be at least 8 characters');
      expect(result.warnings).toEqual({});
    });

    it('should treat custom validation as warnings in non-strict mode', () => {
      // Bug: Should treat custom validation as warnings in non-strict mode
      const rules: ValidationRule[] = [
        {
          field: 'password',
          type: 'string',
          required: true,
          custom: (value) => value.length >= 8 || 'Password must be at least 8 characters'
        }
      ];

      const data = { password: 'short' };
      const result = validateData(data, rules, { strictMode: false });

      expect(result.isValid).toBe(false); // Still invalid due to warnings
      expect(result.warnings.password).toContain('Password must be at least 8 characters');
      expect(result.errors).toEqual({});
    });
  });

  describe('Metadata Generation', () => {
    it('should generate validation metadata', () => {
      // Bug: Should generate validation metadata
      const rules: ValidationRule[] = [
        {
          field: 'email',
          type: 'email',
          required: true
        },
        {
          field: 'name',
          type: 'string',
          required: false
        }
      ];

      const data = { email: 'test@example.com', name: 'John' };
      const result = validateData(data, rules);

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.email).toEqual({
        type: 'email',
        required: true,
        validated: true
      });
      expect(result.metadata?.name).toEqual({
        type: 'string',
        required: false,
        validated: true
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data gracefully', () => {
      // Bug: Should handle empty data gracefully
      const rules: ValidationRule[] = [
        {
          field: 'optional_field',
          type: 'string',
          required: false
        }
      ];

      const result = validateData({}, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should handle null values correctly', () => {
      // Bug: Should handle null values correctly
      const rules: ValidationRule[] = [
        {
          field: 'optional_field',
          type: 'string',
          required: false
        }
      ];

      const result = validateData({ optional_field: null }, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should handle undefined values correctly', () => {
      // Bug: Should handle undefined values correctly
      const rules: ValidationRule[] = [
        {
          field: 'optional_field',
          type: 'string',
          required: false
        }
      ];

      const result = validateData({ optional_field: undefined }, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should handle circular references in objects', () => {
      // Bug: Should handle circular references in objects
      const circular: any = { name: 'test' };
      circular.self = circular;

      const sanitized = sanitizeObject(circular);

      expect(sanitized).toBeDefined();
      expect(sanitized.name).toBe('test');
      expect(sanitized.self).toBeDefined();
    });

    it('should handle very large strings', () => {
      // Bug: Should handle very large strings
      const largeString = 'x'.repeat(10000);
      const rules: ValidationRule[] = [
        {
          field: 'content',
          type: 'string',
          required: true,
          maxLength: 5000
        }
      ];

      const result = validateData({ content: largeString }, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.content).toContain('content must not exceed 5000 characters');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex validation scenarios', () => {
      // Bug: Should handle complex validation scenarios
      const rules: ValidationRule[] = [
        {
          field: 'user',
          type: 'object',
          required: true,
          properties: {
            email: {
              field: 'email',
              type: 'email',
              required: true,
              transform: (value) => value.toLowerCase().trim()
            },
            profile: {
              field: 'profile',
              type: 'object',
              required: false,
              properties: {
                bio: {
                  field: 'bio',
                  type: 'string',
                  maxLength: 500,
                  sanitize: true
                },
                interests: {
                  field: 'interests',
                  type: 'array',
                  items: [
                    {
                      field: 'interest',
                      type: 'string',
                      minLength: 2
                    }
                  ]
                }
              }
            }
          }
        }
      ];

      const complexData = {
        user: {
          email: '  TEST@EXAMPLE.COM  ',
          profile: {
            bio: '<script>alert("xss")</script>My bio',
            interests: ['music', 'a', 'sports']
          }
        }
      };

      const result = validateData(complexData, rules, {
        enableTransform: true,
        enableSanitization: true
      });

      expect(result.isValid).toBe(false); // 'a' is too short
      expect(result.errors.user).toContain('user: interests[1]: interest must be at least 2 characters long');
      expect(result.sanitizedData.user.email).toBe('test@example.com');
      expect(result.sanitizedData.user.profile.bio).toContain('&lt;/script&gt;');
    });
  });
});
