import { isValidEmail, isValidPhone, isValidObjectId, validatePagination, validateRequiredFields, sanitizeString, isValidDate, isFutureDate } from '../utils/validators';

describe('Validators Extended Tests', () => {
  describe('isValidEmail extended tests', () => {
    it('should validate email with subdomain', () => {
      expect(isValidEmail('user@sub.domain.com')).toBe(true);
    });

    it('should validate email with multiple subdomains', () => {
      expect(isValidEmail('user@mail.sub.domain.com')).toBe(true);
    });

    it('should validate email with numbers', () => {
      expect(isValidEmail('user123@domain.com')).toBe(true);
    });

    it('should validate email with plus sign', () => {
      expect(isValidEmail('user+tag@domain.com')).toBe(true);
    });

    it('should validate email with underscore', () => {
      expect(isValidEmail('user_name@domain.com')).toBe(true);
    });

    it('should validate email with hyphen', () => {
      expect(isValidEmail('user-name@domain.com')).toBe(true);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('user@')).toBe(false);
    });

    it('should reject email without @', () => {
      expect(isValidEmail('userdomain.com')).toBe(false);
    });

    it('should reject email with multiple @', () => {
      expect(isValidEmail('user@@domain.com')).toBe(false);
    });

    it('should reject email starting with special char', () => {
      expect(isValidEmail('.user@domain.com')).toBe(false);
    });
  });

  describe('isValidPhone extended tests', () => {
    it('should validate phone with country code', () => {
      expect(isValidPhone('+919876543210')).toBe(true);
    });

    it('should validate phone with spaces', () => {
      expect(isValidPhone('9876 543 210')).toBe(true);
    });

    it('should validate phone with dashes', () => {
      expect(isValidPhone('9876-543-210')).toBe(true);
    });

    it('should validate phone with parentheses', () => {
      expect(isValidPhone('(987) 654-3210')).toBe(true);
    });

    it('should reject phone with letters', () => {
      expect(isValidPhone('98765abc3210')).toBe(false);
    });

    it('should reject too short phone', () => {
      expect(isValidPhone('12345')).toBe(false);
    });

    it('should reject too long phone', () => {
      expect(isValidPhone('123456789012345')).toBe(false);
    });

    it('should reject phone with special chars only', () => {
      expect(isValidPhone('!@#$%^&*()')).toBe(false);
    });

    it('should reject empty phone', () => {
      expect(isValidPhone('')).toBe(false);
    });

    it('should reject phone with spaces only', () => {
      expect(isValidPhone('   ')).toBe(false);
    });
  });

  describe('isValidObjectId extended tests', () => {
    it('should validate valid ObjectId with mixed case', () => {
      expect(isValidObjectId('507f1f77bcf86cd7994390AB')).toBe(true);
    });

    it('should reject invalid length ObjectId', () => {
      expect(isValidObjectId('507f1f77bcf86cd7994390')).toBe(false);
    });

    it('should reject ObjectId with invalid characters', () => {
      expect(isValidObjectId('507f1f77bcf86cd7994390!@')).toBe(false);
    });

    it('should reject empty ObjectId', () => {
      expect(isValidObjectId('')).toBe(false);
    });

    it('should reject null ObjectId', () => {
      expect(isValidObjectId(null as any)).toBe(false);
    });

    it('should reject undefined ObjectId', () => {
      expect(isValidObjectId(undefined as any)).toBe(false);
    });

    it('should reject numeric ObjectId', () => {
      expect(isValidObjectId(12345 as any)).toBe(false);
    });

    it('should reject ObjectId with spaces', () => {
      expect(isValidObjectId('507f1f77bcf86cd79943901 ')).toBe(false);
    });
  });

  describe('validatePagination extended tests', () => {
    it('should validate valid pagination with both params', () => {
      expect(validatePagination(1, 10)).toEqual({ page: 1, pageSize: 10, skip: 0 });
    });

    it('should use defaults when params missing', () => {
      expect(validatePagination(null, null)).toEqual({ page: 1, pageSize: 10, skip: 0 });
    });

    it('should handle string numbers', () => {
      expect(validatePagination('2', '20')).toEqual({ page: 2, pageSize: 20, skip: 20 });
    });

    it('should handle zero values', () => {
      expect(validatePagination(0, 0)).toEqual({ page: 1, pageSize: 10, skip: 0 });
    });

    it('should handle negative values', () => {
      expect(validatePagination(-1, -5)).toEqual({ page: 1, pageSize: 10, skip: 0 });
    });

    it('should handle decimal values', () => {
      expect(validatePagination(1.5, 10.7)).toEqual({ page: 1, pageSize: 10, skip: 0 });
    });

    it('should cap pageSize at 100', () => {
      expect(validatePagination(1, 200)).toEqual({ page: 1, pageSize: 100, skip: 0 });
    });

    it('should handle very large values', () => {
      expect(validatePagination(999999, 50)).toEqual({ page: 999999, pageSize: 50, skip: 49999450 });
    });

    it('should handle partial pagination', () => {
      expect(validatePagination(5, null)).toEqual({ page: 5, pageSize: 10, skip: 40 });
    });

    it('should handle partial pagination with pageSize only', () => {
      expect(validatePagination(null, 25)).toEqual({ page: 1, pageSize: 25, skip: 0 });
    });
  });

  describe('validateRequiredFields extended tests', () => {
    it('should validate all required fields present', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const result = validateRequiredFields(data, ['name', 'email', 'age']);
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should reject missing required field', () => {
      const data = { name: 'John', age: 30 };
      const result = validateRequiredFields(data, ['name', 'email', 'age']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['email']);
    });

    it('should reject empty required field', () => {
      const data = { name: 'John', email: '', age: 30 };
      const result = validateRequiredFields(data, ['name', 'email', 'age']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['email']);
    });

    it('should reject null required field', () => {
      const data = { name: 'John', email: null, age: 30 };
      const result = validateRequiredFields(data, ['name', 'email', 'age']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['email']);
    });

    it('should reject undefined required field', () => {
      const data = { name: 'John', age: 30 };
      const result = validateRequiredFields(data, ['name', 'email', 'age']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['email']);
    });

    it('should handle empty required fields array', () => {
      const data = { name: 'John' };
      const result = validateRequiredFields(data, []);
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should handle no data', () => {
      const result = validateRequiredFields({}, ['name']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['name']);
    });

    it('should handle null data', () => {
      const result = validateRequiredFields(null, ['name']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['name']);
    });

    it('should validate nested object fields', () => {
      const data = { user: { name: 'John' }, settings: { theme: 'dark' } };
      const result = validateRequiredFields(data, ['user', 'settings']);
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should reject missing nested fields', () => {
      const data = { user: { name: 'John' } };
      const result = validateRequiredFields(data, ['user', 'settings']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['settings']);
    });
  });

  describe('sanitizeString extended tests', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should remove multiple HTML tags', () => {
      expect(sanitizeString('<div><p>Hello</p></div>')).toBe('&lt;div&gt;&lt;p&gt;Hello&lt;&#x2F;p&gt;&lt;&#x2F;div&gt;');
    });

    it('should handle nested HTML tags', () => {
      expect(sanitizeString('<div><span><b>Bold</b></span></div>')).toBe('&lt;div&gt;&lt;span&gt;&lt;b&gt;Bold&lt;&#x2F;b&gt;&lt;&#x2F;span&gt;&lt;&#x2F;div&gt;');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should handle multiple spaces', () => {
      expect(sanitizeString('hello    world')).toBe('hello    world');
    });

    it('should handle newlines', () => {
      expect(sanitizeString('hello\nworld')).toBe('hello\nworld');
    });

    it('should handle tabs', () => {
      expect(sanitizeString('hello\tworld')).toBe('hello\tworld');
    });

    it('should handle null input', () => {
      expect(sanitizeString(null as any)).toBe('');
    });

    it('should handle undefined input', () => {
      expect(sanitizeString(undefined as any)).toBe('');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should handle self-closing tags', () => {
      expect(sanitizeString('<img src="test.jpg" />')).toBe('&lt;img src=&quot;test.jpg&quot; &#x2F;&gt;');
    });

    it('should handle attributes in tags', () => {
      expect(sanitizeString('<div class="test" id="main">content</div>')).toBe('&lt;div class=&quot;test&quot; id=&quot;main&quot;&gt;content&lt;&#x2F;div&gt;');
    });
  });

  describe('isValidDate extended tests', () => {
    it('should validate valid date string', () => {
      expect(isValidDate('2025-12-25')).toBe(true);
    });

    it('should validate ISO date string', () => {
      expect(isValidDate('2025-12-25T10:30:00.000Z')).toBe(true);
    });

    it('should reject invalid date string', () => {
      expect(isValidDate('invalid-date')).toBe(false);
    });

    it('should reject impossible date', () => {
      expect(isValidDate('2025-02-30')).toBe(false);
    });

    it('should reject null', () => {
      expect(isValidDate(null as any)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isValidDate(undefined as any)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidDate('')).toBe(false);
    });

    it('should reject invalid timestamp string', () => {
      expect(isValidDate('invalid-timestamp')).toBe(false);
    });

    it('should validate date with time', () => {
      expect(isValidDate('2025-12-25 15:30:00')).toBe(true);
    });

    it('should reject date with invalid format', () => {
      expect(isValidDate('25/12/2025')).toBe(false);
    });
  });

  describe('isFutureDate extended tests', () => {
    it('should validate future date string', () => {
      expect(isFutureDate('2030-12-25')).toBe(true);
    });

    it('should reject past date string', () => {
      expect(isFutureDate('2020-12-25')).toBe(false);
    });

    it('should reject current date string', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isFutureDate(today)).toBe(false);
    });

    it('should handle null', () => {
      expect(isFutureDate(null as any)).toBe(false);
    });

    it('should handle undefined', () => {
      expect(isFutureDate(undefined as any)).toBe(false);
    });

    it('should handle invalid date', () => {
      expect(isFutureDate('invalid-date')).toBe(false);
    });

    it('should validate far future date', () => {
      expect(isFutureDate('2100-01-01')).toBe(true);
    });

    it('should reject very old date', () => {
      expect(isFutureDate('1900-01-01')).toBe(false);
    });

    it('should handle ISO date string', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isFutureDate(futureDate.toISOString().split('T')[0])).toBe(true);
    });

    it('should reject date with invalid format', () => {
      expect(isFutureDate('25/12/2030')).toBe(false);
    });
  });
});
