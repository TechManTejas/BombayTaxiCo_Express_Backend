import {
  isValidEmail,
  isValidPhone,
  isValidObjectId,
  validatePagination,
  validateRequiredFields,
  sanitizeString,
  isValidDate,
  isFutureDate,
} from '../utils/validators';

describe('Validators Additional Tests', () => {
  describe('isValidEmail', () => {
    it('should handle email with numbers in domain', () => {
      expect(isValidEmail('user@domain123.com')).toBe(true);
    });

    it('should handle email with multiple dots', () => {
      expect(isValidEmail('user.name.long@domain.co.in')).toBe(true);
    });

    it('should reject email with consecutive dots', () => {
      expect(isValidEmail('user..name@domain.com')).toBe(false);
    });

    it('should reject email starting with dot', () => {
      expect(isValidEmail('.user@domain.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should handle phone with country code +91', () => {
      expect(isValidPhone('+919876543210')).toBe(true);
    });

    it('should handle phone with 91 prefix', () => {
      expect(isValidPhone('919876543210')).toBe(true);
    });

    it('should reject phone with invalid starting digit', () => {
      expect(isValidPhone('1234567890')).toBe(false);
    });

    it('should reject phone with letters', () => {
      expect(isValidPhone('98765abcde')).toBe(false);
    });
  });

  describe('isValidObjectId', () => {
    it('should accept valid 24-character hex string', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('should reject short ObjectId', () => {
      expect(isValidObjectId('507f1f77bcf86cd7994390')).toBe(false);
    });

    it('should reject non-hex characters', () => {
      expect(isValidObjectId('507f1f77bcf86cd79943901g')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidObjectId('')).toBe(false);
    });
  });

  describe('validatePagination', () => {
    it('should handle valid pagination values', () => {
      expect(validatePagination({ page: 1, pageSize: 10 })).toEqual({ page: 1, pageSize: 10 });
    });

    it('should use defaults for missing values', () => {
      expect(validatePagination({})).toEqual({ page: 1, pageSize: 10 });
    });

    it('should handle string numbers', () => {
      expect(validatePagination({ page: '2', pageSize: '20' } as any)).toEqual({ page: 2, pageSize: 20 });
    });

    it('should handle zero values', () => {
      expect(validatePagination({ page: 0, pageSize: 0 })).toEqual({ page: 1, pageSize: 10 });
    });
  });

  describe('validateRequiredFields', () => {
    it('should pass when all required fields are present', () => {
      const data = { name: 'John', email: 'john@example.com' };
      expect(validateRequiredFields(data, ['name', 'email'])).toBe(true);
    });

    it('should fail when required field is missing', () => {
      const data = { name: 'John' };
      expect(validateRequiredFields(data, ['name', 'email'])).toBe(false);
    });

    it('should fail when required field is empty string', () => {
      const data = { name: 'John', email: '' };
      expect(validateRequiredFields(data, ['name', 'email'])).toBe(false);
    });

    it('should fail when required field is null', () => {
      const data = { name: 'John', email: null };
      expect(validateRequiredFields(data, ['name', 'email'])).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should handle null input', () => {
      expect(sanitizeString(null as any)).toBe('');
    });
  });

  describe('isValidDate', () => {
    it('should accept valid date string', () => {
      expect(isValidDate('2025-06-15')).toBe(true);
    });

    it('should accept Date object', () => {
      expect(isValidDate(new Date())).toBe(true);
    });

    it('should reject invalid date string', () => {
      expect(isValidDate('not-a-date')).toBe(false);
    });

    it('should reject null', () => {
      expect(isValidDate(null)).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should accept future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should reject past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isFutureDate(pastDate)).toBe(false);
    });

    it('should reject current date', () => {
      expect(isFutureDate(new Date())).toBe(false);
    });

    it('should handle future date string', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isFutureDate(futureDate.toISOString().split('T')[0])).toBe(true);
    });
  });
});
