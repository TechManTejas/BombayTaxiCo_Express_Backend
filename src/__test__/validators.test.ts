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

describe('isValidEmail', () => {
  test('returns true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  test('returns true for email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });

  test('returns false for invalid email', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isValidEmail(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isValidEmail(undefined)).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  test('trims whitespace before validating', () => {
    expect(isValidEmail('  test@example.com  ')).toBe(true);
  });
});

describe('isValidPhone', () => {
  test('returns true for valid Indian phone', () => {
    expect(isValidPhone('9876543210')).toBe(true);
  });

  test('returns true for phone starting with 6', () => {
    expect(isValidPhone('6123456789')).toBe(true);
  });

  test('returns false for phone starting with 5', () => {
    expect(isValidPhone('5123456789')).toBe(false);
  });

  test('returns false for short number', () => {
    expect(isValidPhone('12345')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isValidPhone(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isValidPhone(undefined)).toBe(false);
  });

  test('handles numeric input without crashing', () => {
    expect(isValidPhone(9876543210 as any)).toBe(true);
  });

  test('strips non-digit characters', () => {
    expect(isValidPhone('987-654-3210')).toBe(true);
  });
});

describe('isValidObjectId', () => {
  test('returns true for valid ObjectId', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
  });

  test('returns false for short string', () => {
    expect(isValidObjectId('abc123')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isValidObjectId(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isValidObjectId(undefined)).toBe(false);
  });

  test('returns false for non-hex string', () => {
    expect(isValidObjectId('zzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false);
  });
});

describe('validatePagination', () => {
  test('returns defaults for null inputs', () => {
    const result = validatePagination(null, null);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.skip).toBe(0);
  });

  test('parses string page and pageSize', () => {
    const result = validatePagination('3', '20');
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(20);
    expect(result.skip).toBe(40);
  });

  test('caps pageSize at 100', () => {
    const result = validatePagination('1', '500');
    expect(result.pageSize).toBe(100);
  });

  test('handles negative page', () => {
    const result = validatePagination('-1', '10');
    expect(result.page).toBe(1);
  });

  test('handles zero pageSize', () => {
    const result = validatePagination('1', '0');
    expect(result.pageSize).toBe(10);
  });

  test('handles NaN strings', () => {
    const result = validatePagination('abc', 'xyz');
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });
});

describe('validateRequiredFields', () => {
  test('returns valid for all fields present', () => {
    const result = validateRequiredFields({ name: 'John', email: 'a@b.com' }, ['name', 'email']);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test('returns missing fields', () => {
    const result = validateRequiredFields({ name: 'John' }, ['name', 'email']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('email');
  });

  test('treats empty string as missing', () => {
    const result = validateRequiredFields({ name: '' }, ['name']);
    expect(result.valid).toBe(false);
  });

  test('handles null data', () => {
    const result = validateRequiredFields(null, ['name']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('name');
  });

  test('handles undefined data', () => {
    const result = validateRequiredFields(undefined, ['name']);
    expect(result.valid).toBe(false);
  });
});

describe('sanitizeString', () => {
  test('escapes HTML tags', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toContain('&lt;');
    expect(sanitizeString('<script>alert("xss")</script>')).toContain('&gt;');
  });

  test('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  test('returns empty for null', () => {
    expect(sanitizeString(null)).toBe('');
  });

  test('returns empty for undefined', () => {
    expect(sanitizeString(undefined)).toBe('');
  });

  test('handles numeric input', () => {
    expect(sanitizeString(12345 as any)).toBe('12345');
  });
});

describe('isValidDate', () => {
  test('returns true for valid date string', () => {
    expect(isValidDate('2025-06-15')).toBe(true);
  });

  test('returns false for invalid date', () => {
    expect(isValidDate('not-a-date')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isValidDate(null)).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isValidDate('')).toBe(false);
  });
});

describe('isFutureDate', () => {
  test('returns true for future date', () => {
    expect(isFutureDate('2030-12-31')).toBe(true);
  });

  test('returns false for past date', () => {
    expect(isFutureDate('2020-01-01')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isFutureDate(null)).toBe(false);
  });

  test('returns false for invalid date', () => {
    expect(isFutureDate('garbage')).toBe(false);
  });
});
