/**
 * F2P tests for input validator utility.
 * These tests would fail on the base branch and pass after the fixes.
 */

import { 
  InputValidator,
  inputValidator,
  ValidationRule,
  ValidationResult,
  ValidationSchema,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidUsername,
  userRegistrationSchema,
  userProfileSchema,
  bookingSchema,
  validateRequest,
  isValidationRule,
  isValidationSchema,
  formatValidationErrors,
  getFirstValidationError,
  createRequiredRule,
  createLengthRule,
  createPatternRule,
  createCustomRule,
  commonPatterns,
  sanitizeString,
  sanitizeNumber,
  sanitizeEmail,
  getValidationStats,
  validateBatch,
  createAsyncValidator
} from '../utils/input-validator';

describe('Input Validator F2P Tests', () => {
  let validator: InputValidator;

  beforeEach(() => {
    validator = InputValidator.getInstance();
  });

  describe('InputValidator class', () => {
    it('should be a singleton', () => {
      const instance1 = InputValidator.getInstance();
      const instance2 = InputValidator.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should validate required field with valid value', () => {
      const rule: ValidationRule = { required: true };
      const result = validator.validate('test', rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate required field with empty value', () => {
      const rule: ValidationRule = { required: true };
      const result = validator.validate('', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should validate required field with null value', () => {
      const rule: ValidationRule = { required: true };
      const result = validator.validate(null, rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should validate required field with undefined value', () => {
      const rule: ValidationRule = { required: true };
      const result = validator.validate(undefined, rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should validate minimum length', () => {
      const rule: ValidationRule = { minLength: 5 };
      const result = validator.validate('test', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum length is 5 characters');
    });

    it('should validate maximum length', () => {
      const rule: ValidationRule = { maxLength: 3 };
      const result = validator.validate('test', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum length is 3 characters');
    });

    it('should validate pattern', () => {
      const rule: ValidationRule = { pattern: /^[a-z]+$/ };
      const result = validator.validate('Test123', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid format');
    });

    it('should validate email', () => {
      const rule: ValidationRule = { email: true };
      const result = validator.validate('invalid-email', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email address');
    });

    it('should validate valid email', () => {
      const rule: ValidationRule = { email: true };
      const result = validator.validate('test@example.com', rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate URL', () => {
      const rule: ValidationRule = { url: true };
      const result = validator.validate('not-a-url', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid URL');
    });

    it('should validate valid URL', () => {
      const rule: ValidationRule = { url: true };
      const result = validator.validate('https://example.com', rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate numeric', () => {
      const rule: ValidationRule = { numeric: true };
      const result = validator.validate('abc', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be a number');
    });

    it('should validate valid numeric', () => {
      const rule: ValidationRule = { numeric: true };
      const result = validator.validate('123.45', rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate alpha', () => {
      const rule: ValidationRule = { alpha: true };
      const result = validator.validate('test123', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must contain only letters');
    });

    it('should validate valid alpha', () => {
      const rule: ValidationRule = { alpha: true };
      const result = validator.validate('test', rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate alpha numeric', () => {
      const rule: ValidationRule = { alphaNumeric: true };
      const result = validator.validate('test-123', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must contain only letters and numbers');
    });

    it('should validate valid alpha numeric', () => {
      const rule: ValidationRule = { alphaNumeric: true };
      const result = validator.validate('test123', rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate custom rule returning false', () => {
      const rule: ValidationRule = {
        custom: () => false
      };
      const result = validator.validate('test', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid value');
    });

    it('should validate custom rule returning string', () => {
      const rule: ValidationRule = {
        custom: () => 'Custom error message'
      };
      const result = validator.validate('test', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom error message');
    });

    it('should validate custom rule returning true', () => {
      const rule: ValidationRule = {
        custom: () => true
      };
      const result = validator.validate('test', rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate schema', () => {
      const schema: ValidationSchema = {
        username: { required: true, minLength: 3 },
        email: { required: true, email: true }
      };
      
      const data = { username: 'ab', email: 'invalid' };
      const result = validator.validateSchema(data, schema);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('username: Minimum length is 3 characters');
      expect(result.errors).toContain('email: Invalid email address');
    });

    it('should validate valid schema', () => {
      const schema: ValidationSchema = {
        username: { required: true, minLength: 3 },
        email: { required: true, email: true }
      };
      
      const data = { username: 'test', email: 'test@example.com' };
      const result = validator.validateSchema(data, schema);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Built-in validators', () => {
    it('should validate email with built-in method', () => {
      const result = validator.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email with built-in method', () => {
      const result = validator.validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email address');
    });

    it('should validate password with built-in method', () => {
      const result = validator.validatePassword('Password123!');
      expect(result.isValid).toBe(true);
    });

    it('should reject weak password with built-in method', () => {
      const result = validator.validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate phone with built-in method', () => {
      const result = validator.validatePhone('+1 (555) 123-4567');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid phone with built-in method', () => {
      const result = validator.validatePhone('invalid-phone');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid format');
    });

    it('should validate username with built-in method', () => {
      const result = validator.validateUsername('testuser');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid username with built-in method', () => {
      const result = validator.validateUsername('test@user');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate required with built-in method', () => {
      const result = validator.validateRequired('test');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty required with built-in method', () => {
      const result = validator.validateRequired('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });
  });

  describe('Predefined schemas', () => {
    it('should validate user registration schema', () => {
      const data = {
        username: 'test',
        email: 'test@example.com',
        password: 'Password123!',
        phone: '+1234567890'
      };
      
      const result = validator.validateSchema(data, userRegistrationSchema);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid user registration', () => {
      const data = {
        username: 'ab', // Too short
        email: 'invalid-email',
        password: 'weak',
        phone: 'invalid-phone'
      };
      
      const result = validator.validateSchema(data, userRegistrationSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate user profile schema', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        bio: 'Test bio'
      };
      
      const result = validator.validateSchema(data, userProfileSchema);
      expect(result.isValid).toBe(true);
    });

    it('should validate booking schema', () => {
      const data = {
        pickupLocation: '123 Main St',
        dropoffLocation: '456 Oak Ave',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        passengerCount: '2'
      };
      
      const result = validator.validateSchema(data, bookingSchema);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid booking', () => {
      const data = {
        pickupLocation: '123', // Too short
        dropoffLocation: '456', // Too short
        scheduledTime: 'invalid-date',
        passengerCount: '15' // Too many passengers
      };
      
      const result = validator.validateSchema(data, bookingSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Utility functions', () => {
    it('should check valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should check valid password', () => {
      expect(isValidPassword('Password123!')).toBe(true);
      expect(isValidPassword('weak')).toBe(false);
    });

    it('should check valid phone', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('invalid-phone')).toBe(false);
    });

    it('should check valid username', () => {
      expect(isValidUsername('testuser')).toBe(true);
      expect(isValidUsername('test@user')).toBe(false);
    });

    it('should format validation errors', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const result = formatValidationErrors(errors);
      
      expect(result).toBe('Error 1, Error 2, Error 3');
    });

    it('should get first validation error', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const result = getFirstValidationError(errors);
      
      expect(result).toBe('Error 1');
    });

    it('should return null for empty errors', () => {
      const result = getFirstValidationError([]);
      expect(result).toBeNull();
    });
  });

  describe('Validation rule builders', () => {
    it('should create required rule', () => {
      const rule = createRequiredRule('Custom required message');
      
      expect(rule.required).toBe(true);
      expect(rule.custom).toBeDefined();
    });

    it('should create length rule', () => {
      const rule = createLengthRule(5, 10);
      
      expect(rule.minLength).toBe(5);
      expect(rule.maxLength).toBe(10);
    });

    it('should create pattern rule', () => {
      const pattern = /^[a-z]+$/;
      const rule = createPatternRule(pattern, 'Custom pattern error');
      
      expect(rule.pattern).toBe(pattern);
      expect(rule.custom).toBeDefined();
    });

    it('should create custom rule', () => {
      const validator = (value: any) => value === 'valid';
      const rule = createCustomRule(validator);
      
      expect(rule.custom).toBe(validator);
    });
  });

  describe('Common patterns', () => {
    it('should have email pattern', () => {
      expect(commonPatterns.email).toBeDefined();
      expect(commonPatterns.email.test('test@example.com')).toBe(true);
    });

    it('should have phone pattern', () => {
      expect(commonPatterns.phone).toBeDefined();
      expect(commonPatterns.phone.test('+1234567890')).toBe(true);
    });

    it('should have password pattern', () => {
      expect(commonPatterns.password).toBeDefined();
      expect(commonPatterns.password.test('Password123!')).toBe(true);
    });

    it('should have username pattern', () => {
      expect(commonPatterns.username).toBeDefined();
      expect(commonPatterns.username.test('testuser')).toBe(true);
    });

    it('should have slug pattern', () => {
      expect(commonPatterns.slug).toBeDefined();
      expect(commonPatterns.slug.test('test-slug')).toBe(true);
    });

    it('should have hex pattern', () => {
      expect(commonPatterns.hex).toBeDefined();
      expect(commonPatterns.hex.test('#ffffff')).toBe(true);
    });

    it('should have UUID pattern', () => {
      expect(commonPatterns.uuid).toBeDefined();
      expect(commonPatterns.uuid.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });
  });

  describe('Sanitization utilities', () => {
    it('should sanitize string', () => {
      expect(sanitizeString('  test  ')).toBe('test');
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('123');
    });

    it('should sanitize number', () => {
      expect(sanitizeNumber('123')).toBe(123);
      expect(sanitizeNumber('123.45')).toBe(123.45);
      expect(sanitizeNumber('invalid')).toBeNull();
      expect(sanitizeNumber(null)).toBeNull();
      expect(sanitizeNumber(undefined)).toBeNull();
    });

    it('should sanitize email', () => {
      expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(sanitizeEmail(null)).toBe('');
      expect(sanitizeEmail(undefined)).toBe('');
    });
  });

  describe('Validation statistics', () => {
    it('should calculate validation stats', () => {
      const results: ValidationResult[] = [
        { isValid: true, errors: [] },
        { isValid: false, errors: ['Error 1'] },
        { isValid: true, errors: [] },
        { isValid: false, errors: ['Error 2', 'Error 3'] }
      ];
      
      const stats = getValidationStats(results);
      
      expect(stats.total).toBe(4);
      expect(stats.valid).toBe(2);
      expect(stats.invalid).toBe(2);
      expect(stats.errorRate).toBe(50);
    });

    it('should handle empty results', () => {
      const results: ValidationResult[] = [];
      const stats = getValidationStats(results);
      
      expect(stats.total).toBe(0);
      expect(stats.valid).toBe(0);
      expect(stats.invalid).toBe(0);
      expect(stats.errorRate).toBe(0);
    });
  });

  describe('Batch validation', () => {
    it('should validate batch of data', () => {
      const dataArray = [
        { username: 'test', email: 'test@example.com' },
        { username: 'ab', email: 'invalid' }, // Invalid
        { username: 'user2', email: 'user2@example.com' }
      ];
      
      const schema: ValidationSchema = {
        username: { required: true, minLength: 3 },
        email: { required: true, email: true }
      };
      
      const results = validateBatch(dataArray, schema);
      
      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(true);
    });
  });

  describe('Type guards', () => {
    it('should identify validation rule', () => {
      expect(isValidationRule({ required: true })).toBe(true);
      expect(isValidationRule(null)).toBe(false);
      expect(isValidationRule('string')).toBe(false);
    });

    it('should identify validation schema', () => {
      expect(isValidationSchema({ field1: { required: true }, field2: { minLength: 5 } })).toBe(true);
      expect(isValidationSchema({ field1: 'invalid' })).toBe(false);
      expect(isValidationSchema(null)).toBe(false);
      expect(isValidationSchema('string')).toBe(false);
    });
  });

  describe('Express middleware', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      mockReq = { body: { username: 'test', email: 'test@example.com' } };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('should pass validation with valid data', () => {
      const schema: ValidationSchema = {
        username: { required: true },
        email: { required: true, email: true }
      };
      
      const middleware = validateRequest(schema);
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid data', () => {
      const schema: ValidationSchema = {
        username: { required: true },
        email: { required: true, email: true }
      };
      
      mockReq.body = { username: '', email: 'invalid' };
      
      const middleware = validateRequest(schema);
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        errors: expect.arrayContaining([
          expect.stringContaining('username'),
          expect.stringContaining('email')
        ])
      });
    });
  });

  describe('Async validation', () => {
    it('should create async validator', async () => {
      const asyncValidator = createAsyncValidator(async (value: any) => {
        return value === 'valid';
      });
      
      const result = await asyncValidator('valid');
      expect(result).toBe(true);
      
      const result2 = await asyncValidator('invalid');
      expect(result2).toBe(false);
    });

    it('should handle async validator errors', async () => {
      const asyncValidator = createAsyncValidator(async (value: any) => {
        throw new Error('Validation error');
      });
      
      const result = await asyncValidator('test');
      expect(result).toBe('Validation failed');
    });

    it('should handle async validator with string result', async () => {
      const asyncValidator = createAsyncValidator(async (value: any) => {
        return 'Custom async error';
      });
      
      const result = await asyncValidator('test');
      expect(result).toBe('Custom async error');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string with non-required rule', () => {
      const rule: ValidationRule = { minLength: 5 };
      const result = validator.validate('', rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle null with non-required rule', () => {
      const rule: ValidationRule = { minLength: 5 };
      const result = validator.validate(null, rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle undefined with non-required rule', () => {
      const rule: ValidationRule = { minLength: 5 };
      const result = validator.validate(undefined, rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle zero with numeric rule', () => {
      const rule: ValidationRule = { numeric: true };
      const result = validator.validate(0, rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle negative numbers with numeric rule', () => {
      const rule: ValidationRule = { numeric: true };
      const result = validator.validate(-123, rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle floating point numbers with numeric rule', () => {
      const rule: ValidationRule = { numeric: true };
      const result = validator.validate(123.456, rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle boolean values', () => {
      const rule: ValidationRule = { required: true };
      const result = validator.validate(true, rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle array values', () => {
      const rule: ValidationRule = { required: true };
      const result = validator.validate([1, 2, 3], rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle object values', () => {
      const rule: ValidationRule = { required: true };
      const result = validator.validate({ key: 'value' }, rule);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should handle large validation batch efficiently', () => {
      const dataArray = Array.from({ length: 1000 }, (_, i) => ({
        username: `user${i}`,
        email: `user${i}@example.com`
      }));
      
      const schema: ValidationSchema = {
        username: { required: true, minLength: 3 },
        email: { required: true, email: true }
      };
      
      const startTime = Date.now();
      const results = validateBatch(dataArray, schema);
      const endTime = Date.now();
      
      expect(results).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle complex schema validation efficiently', () => {
      const complexSchema: ValidationSchema = {
        field1: { required: true, minLength: 5, maxLength: 50 },
        field2: { required: true, email: true },
        field3: { pattern: /^[A-Z]+$/ },
        field4: { numeric: true },
        field5: { alpha: true },
        field6: { alphaNumeric: true },
        field7: { url: true },
        field8: { custom: (value) => value.length > 3 }
      };
      
      const data = {
        field1: 'testfield',
        field2: 'test@example.com',
        field3: 'TEST',
        field4: '123',
        field5: 'test',
        field6: 'test123',
        field7: 'https://example.com',
        field8: 'longvalue'
      };
      
      const startTime = Date.now();
      const result = validator.validateSchema(data, complexSchema);
      const endTime = Date.now();
      
      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('Integration scenarios', () => {
    it('should validate complex user registration form', () => {
      const userData = {
        username: 'newuser123',
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        phone: '+1 (555) 123-4567',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'I am a new user with a valid registration form'
      };
      
      // Validate registration schema
      const regResult = validator.validateSchema(userData, userRegistrationSchema);
      expect(regResult.isValid).toBe(true);
      
      // Validate profile schema
      const profileResult = validator.validateSchema(userData, userProfileSchema);
      expect(profileResult.isValid).toBe(true);
    });

    it('should validate booking with multiple passengers', () => {
      const bookingData = {
        pickupLocation: '123 Main Street, New York, NY 10001',
        dropoffLocation: '456 Oak Avenue, Los Angeles, CA 90001',
        scheduledTime: new Date(Date.now() + 86400000 * 2).toISOString(), // Day after tomorrow
        passengerCount: '4',
        specialRequests: 'Please provide child seats'
      };
      
      const result = validator.validateSchema(bookingData, bookingSchema);
      expect(result.isValid).toBe(true);
    });

    it('should handle validation with multiple error types', () => {
      const invalidData = {
        username: 'ab', // Too short
        email: 'invalid-email', // Invalid format
        password: 'weak', // Too weak
        phone: 'abc', // Invalid format
        age: 'underage' // Not a number
      };
      
      const schema: ValidationSchema = {
        username: { required: true, minLength: 3, alphaNumeric: true },
        email: { required: true, email: true },
        password: { required: true, minLength: 8 },
        phone: { pattern: /^\+?[\d\s\-\(\)]+$/ },
        age: { numeric: true, custom: (value) => Number(value) >= 18 }
      };
      
      const result = validator.validateSchema(invalidData, schema);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
      expect(result.errors.some(error => error.includes('username'))).toBe(true);
      expect(result.errors.some(error => error.includes('email'))).toBe(true);
      expect(result.errors.some(error => error.includes('password'))).toBe(true);
    });
  });
});
